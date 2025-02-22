// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";
import "@chainlink/contracts/src/v0.8/vrf/dev/interfaces/IVRFCoordinatorV2Plus.sol";
import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";
import "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import "./VRFConsumerBaseV2PlusUpgradeable.sol";
import "./DateTime/DateTimeContract.sol";


contract LuckyPosition is UUPSUpgradeable, AutomationCompatibleInterface, VRFConsumerBaseV2PlusUpgradeable, PausableUpgradeable {
    DateTimeContract public dateTimeContract;

    address public allowedToken;
    uint256 public gameCounter;
    uint256 public ticketPrice;
    uint128 public duration;

    uint256 public feePercentage;
    uint256 public chainlinkSubscriptionId;
    address public vrfCoordinator;
    bytes32 public keyHash;
    address public forwarderAddress;

    uint256 public resumeHour;
    uint256 public resumeMinute;
    uint256 public resumeSecond;
    uint256 public pauseHour;
    uint256 public pauseMinute;
    uint256 public pauseSecond;

    uint256 public collectedFee;

    enum GameStatus {
        ENDED,
        CREATED,
        PAUSED,
        FAILED,
        PAUSED_BY_ADMIN
    }

    struct Game {
        uint256 ticketPrice;
        uint256 totalPool;
        address winner;
        GameStatus status;
        uint256 startTime;
        uint256 endTime;
    }

    address[] public playerTickets;

    mapping(uint256 => Game) public games;
    mapping(uint256 => uint256) public requestIdToGameId;
    mapping(uint256 => mapping(address => bool)) public hasJoined;
    mapping(uint256 => mapping(address => bool)) public hasClaimedRefund;

    event GameCreated(uint256 ticketPrice, uint256 startTime, uint256 endTime, uint256 gameId);
    event PlayerJoined(address indexed player);
    event GameEnded(address indexed winner, uint256 totalReward);
    event GamePaused();
    event GameResumed();
    event GameFailed(uint256 gameId);
    event FeeUpdated(uint256 newFeePercentage);
    event AllowedTokenUpdated(address newToken);
    event GameParamsUpdated(uint256 ticketPrice, uint128 duration);
    event VRFParametersUpdated(uint256 subscriptionId, address vrfCoordinator, bytes32 keyHash);
    event ForwarderUpdated(address newForwarder);
    event ResumeTimeUpdated(uint256 hour, uint256 minute, uint256 second);
    event PauseTimeUpdated(uint256 hour, uint256 minute, uint256 second);
    event RefundClaimed(address indexed player, uint256 amount);
    event FeeWithdrawn(address indexed admin, uint256 amount);

    function initialize(
        address _vrfCoordinator,
        bytes32 _keyHash,
        uint256 _subscriptionId,
        address _allowedToken,
        address _dateTimeContract
    ) external initializer {
        VRFConsumerBaseV2PlusUpgradeable.__VRFConsumerBaseV2Plus_init(_vrfCoordinator);
        dateTimeContract = DateTimeContract(_dateTimeContract);
        __Pausable_init();

        vrfCoordinator = _vrfCoordinator;
        keyHash = _keyHash;
        chainlinkSubscriptionId = _subscriptionId;
        allowedToken = _allowedToken;
        feePercentage = 1;
        gameCounter = 0;
    }

    modifier OwnerOrContract() {
        require(msg.sender == address(this) || msg.sender == owner(), "Not authorized");
        _;
    }

    modifier validGameParams(uint256 _ticketPrice, uint128 _duration) {
        require(_ticketPrice > 0, "Ticket price must be greater than 0");
        require(
            _duration > 0 && _duration <= 2 hours,
            "Duration must be greater than 0 and less than or equal to 2 hours"
        );
        _;
    }

    function _authorizeUpgrade(address newImplementation) internal view override onlyOwner {
        require(newImplementation != address(0), "Invalid implementation address");
    }

    function setFeePercentage(uint256 _feePercentage) external onlyOwner {
        require(_feePercentage > 0, "Fee percentage not valid");
        require(_feePercentage <= 20, "Fee percentage too high");
        feePercentage = _feePercentage;
        emit FeeUpdated(_feePercentage);
    }

    function setGameParams(
        uint256 _ticketPrice,
        uint128 _duration
    ) external onlyOwner validGameParams(_ticketPrice, _duration) {
        ticketPrice = _ticketPrice;
        duration = _duration;
        emit GameParamsUpdated(_ticketPrice, _duration);
    }

    function setVRFParameters(uint256 _subscriptionId, address _vrfCoordinator, bytes32 _keyHash) external onlyOwner {
        chainlinkSubscriptionId = _subscriptionId;
        vrfCoordinator = _vrfCoordinator;
        keyHash = _keyHash;
        emit VRFParametersUpdated(_subscriptionId, _vrfCoordinator, _keyHash);
    }

    function setAllowedToken(address _token) external onlyOwner {
        require(_token != address(0), "Invalid token address");
        allowedToken = _token;
        emit AllowedTokenUpdated(_token);
    }

    function setForwarder(address _forwarderAddress) external onlyOwner {
        require(_forwarderAddress != address(0), "Invalid forwarder address");
        forwarderAddress = _forwarderAddress;
        emit ForwarderUpdated(_forwarderAddress);
    }

    function setResumeTime(uint256 timestamp) public onlyOwner {
        (, , , uint256 hour, uint256 minute, uint256 second) = dateTimeContract.timestampToDateTime(timestamp);

        resumeHour = hour;
        resumeMinute = minute;
        resumeSecond = second;
        emit ResumeTimeUpdated(hour, minute, second);
    }

    function setPauseTime(uint256 timestamp) public onlyOwner {
        (, , , uint256 hour, uint256 minute, uint256 second) = dateTimeContract.timestampToDateTime(timestamp);
        pauseHour = hour;
        pauseMinute = minute;
        pauseSecond = second;
        emit PauseTimeUpdated(hour, minute, second);
    }

    function getCurrentTime() public view returns (uint256, uint256, uint256) {
        (, , , uint256 currentHour, uint256 currentMinute, uint256 currentSecond) = dateTimeContract
            .timestampToDateTime(block.timestamp);
        return (currentHour, currentMinute, currentSecond);
    }

    function isWithinActiveTime() public view returns (bool) {
        (, , , uint256 currentHour, uint256 currentMinute, uint256 currentSecond) = dateTimeContract
            .timestampToDateTime(block.timestamp);

        bool isAfterResumeTime = currentHour > resumeHour ||
            (currentHour == resumeHour && currentMinute > resumeMinute) ||
            (currentHour == resumeHour && currentMinute == resumeMinute && currentSecond >= resumeSecond);

        bool isBeforePauseTime = currentHour < pauseHour ||
            (currentHour == pauseHour && currentMinute < pauseMinute) ||
            (currentHour == pauseHour && currentMinute == pauseMinute && currentSecond <= pauseSecond);

        return isAfterResumeTime && isBeforePauseTime;
    }

    function pauseGame() external onlyOwner {
        games[gameCounter].status = GameStatus.PAUSED_BY_ADMIN;
        _pause();

        emit GamePaused();
    }

    function resumeGame() external onlyOwner {
        require(games[gameCounter].status == GameStatus.PAUSED_BY_ADMIN, "Game must be paused by admin to resume");
        _unpause();
        games[gameCounter].status = GameStatus.FAILED;
        emit GameFailed(gameCounter);

        this.createGame(ticketPrice, duration);

        emit GameResumed();
    }

    function createGame(
        uint256 _ticketPrice,
        uint128 _duration
    ) external whenNotPaused OwnerOrContract validGameParams(_ticketPrice, _duration) {
        require(isWithinActiveTime(), "Game can only be created during allowed hours");
        require(
            games[gameCounter].status == GameStatus.ENDED || games[gameCounter].status == GameStatus.FAILED,
            "Previous game is not ended yet"
        );

        uint256 endTime = block.timestamp + _duration;

        gameCounter++;

        games[gameCounter] = Game({
            ticketPrice: _ticketPrice,
            totalPool: 0,
            winner: address(0),
            status: GameStatus.CREATED,
            startTime: block.timestamp,
            endTime: endTime
        });

        delete playerTickets;

        emit GameCreated(_ticketPrice, block.timestamp, endTime, gameCounter);
    }

    function joinGame() external whenNotPaused {
        require(!hasJoined[gameCounter][msg.sender], "Player already joined the game");
        require(games[gameCounter].status == GameStatus.CREATED, "Game is not active");
        require(block.timestamp <= games[gameCounter].endTime, "Game has ended");

        require(isWithinActiveTime(), "User can joined during allowed hours");

        IERC20 token = IERC20(allowedToken);
        require(
            token.allowance(msg.sender, address(this)) >= games[gameCounter].ticketPrice,
            "Insufficient token allowance"
        );
        require(token.transferFrom(msg.sender, address(this), games[gameCounter].ticketPrice), "Token transfer failed");

        games[gameCounter].totalPool += games[gameCounter].ticketPrice;
        playerTickets.push(msg.sender);
        hasJoined[gameCounter][msg.sender] = true;

        emit PlayerJoined(msg.sender);
    }

    function requestRandomWordsFromContract(
        bytes32 _keyHash,
        uint256 _chainlinkSubscriptionId,
        uint16 _requestConfirmations,
        uint32 _callbackGasLimit,
        uint32 _numWords
    ) external OwnerOrContract returns (uint256 requestId) {
        require(games[gameCounter].status == GameStatus.ENDED, "Game is not ended");

        VRFV2PlusClient.RandomWordsRequest memory req = VRFV2PlusClient.RandomWordsRequest({
            keyHash: _keyHash,
            subId: _chainlinkSubscriptionId,
            requestConfirmations: _requestConfirmations,
            callbackGasLimit: _callbackGasLimit,
            numWords: _numWords,
            extraArgs: VRFV2PlusClient._argsToBytes(VRFV2PlusClient.ExtraArgsV1({nativePayment: false}))
        });
        requestId = IVRFCoordinatorV2Plus(vrfCoordinator).requestRandomWords(req);
        return requestId;
    }

    function endGame() internal {
        games[gameCounter].status = GameStatus.ENDED;

        try this.requestRandomWordsFromContract(keyHash, chainlinkSubscriptionId, 3, 1000000, 1) returns (
            uint256 requestId
        ) {
            requestIdToGameId[requestId] = gameCounter;
        } catch {
            games[gameCounter].status = GameStatus.FAILED;
            emit GameFailed(gameCounter);
            this.createGame(ticketPrice, duration);
        }
    }

    function fulfillRandomWords(uint256 requestId, uint256[] calldata randomWords) internal override {
        uint256 gameId = requestIdToGameId[requestId];
        Game storage game = games[gameId];

        uint256 playerCount = playerTickets.length;

        uint256 winnerIndex = randomWords[0] % playerCount;
        address winner = playerTickets[winnerIndex];

        game.winner = winner;

        uint256 fee = (game.totalPool * feePercentage) / 100;
        collectedFee += fee;
        uint256 reward = game.totalPool - fee;

        IERC20 token = IERC20(allowedToken);
        (bool success, ) = address(token).call(abi.encodeWithSignature("transfer(address,uint256)", winner, reward));
        require(success, "Reward transfer failed");

        this.createGame(ticketPrice, duration);

        emit GameEnded(winner, reward);
    }

    function checkUpkeep(
        bytes calldata
    ) external view override whenNotPaused returns (bool upkeepNeeded, bytes memory performData) {
        upkeepNeeded = false;
        performData = "";

        (, , , uint256 currentHour, , ) = dateTimeContract.timestampToDateTime(block.timestamp);

        if (games[gameCounter].status == GameStatus.CREATED && block.timestamp >= games[gameCounter].endTime) {
            upkeepNeeded = true;
            performData = abi.encode("endGame");
            return (upkeepNeeded, performData);
        }

        if (games[gameCounter].status == GameStatus.CREATED && currentHour >= 0 && currentHour < resumeHour) {
            upkeepNeeded = true;
            performData = abi.encode("pauseGame");
            return (upkeepNeeded, performData);
        }

        if (games[gameCounter].status == GameStatus.PAUSED && currentHour >= resumeHour && currentHour <= pauseHour) {
            upkeepNeeded = true;
            performData = abi.encode("resumeGame");
            return (upkeepNeeded, performData);
        }
    }

    function performUpkeep(bytes calldata performData) external override {
        require(msg.sender == forwarderAddress, "Caller is not the forwarder");

        string memory action = abi.decode(performData, (string));

        if (keccak256(bytes(action)) == keccak256(bytes("endGame"))) {
            if (playerTickets.length <= 1) {
                games[gameCounter].status = GameStatus.FAILED;
                emit GameFailed(gameCounter);
                this.createGame(ticketPrice, duration);
                return;
            }
            endGame();
        } else if (keccak256(bytes(action)) == keccak256(bytes("pauseGame"))) {
            games[gameCounter].status = GameStatus.PAUSED;

            emit GamePaused();
        } else if (keccak256(bytes(action)) == keccak256(bytes("resumeGame"))) {
            games[gameCounter].status = GameStatus.CREATED;

            emit GameResumed();
        }
    }

    function getGameDetails(uint256 _gameId) external view returns (Game memory) {
        return games[_gameId];
    }

    function getPlayers() external view returns (address[] memory) {
        return playerTickets;
    }
    function claimRefund(uint256[] calldata _gameIds) external {
        uint256 totalRefund = 0;

        for (uint256 i = 0; i < _gameIds.length; i++) {
            uint256 gameId = _gameIds[i];
            Game storage currentGame = games[gameId];

            require(hasJoined[gameId][msg.sender], "You did not participate in this game");
            require(currentGame.status == GameStatus.FAILED, "Game did not fail");
            require(!hasClaimedRefund[gameId][msg.sender], "Refund already claimed for this game");

            totalRefund += currentGame.ticketPrice;

            hasClaimedRefund[gameId][msg.sender] = true;
        }

        IERC20 token = IERC20(allowedToken);
        require(token.transfer(msg.sender, totalRefund), "Refund transfer failed");

        emit RefundClaimed(msg.sender, totalRefund);
    }

    function withDrawFee() external onlyOwner {
        uint256 amount = collectedFee;
        require(amount > 0, "No fee available to withdraw");

        collectedFee = 0;
        

        IERC20 token = IERC20(allowedToken);
        require(token.transfer(msg.sender, amount), "Fee transfer failed");

        emit FeeWithdrawn(msg.sender, amount);
    }
}
