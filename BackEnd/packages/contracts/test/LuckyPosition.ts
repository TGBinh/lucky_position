import { time, loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { expect } from 'chai';
import { ethers, network } from 'hardhat';

describe('LuckyPosition', function () {
  async function setup() {
    const [admin, user1, user2, user3, forwarder] = await ethers.getSigners();

    const BASE_FEE = '1000000000000000';
    const GAS_PRICE = '50000000000';
    const WEI_PER_UNIT_LINK = '6032405486646792';

    const VRFCoordinatorV2_5MockFactory = await ethers.getContractFactory('VRFCoordinatorV2_5Mock');
    const vrfCoordinatorV2_5Mock = await VRFCoordinatorV2_5MockFactory.deploy(BASE_FEE, GAS_PRICE, WEI_PER_UNIT_LINK);
    await vrfCoordinatorV2_5Mock.waitForDeployment();

    const tx = await vrfCoordinatorV2_5Mock['createSubscription']();
    const receipt = await tx.wait();
    const logs = receipt.logs;
    const subscriptionCreatedEvent = vrfCoordinatorV2_5Mock.interface.getEvent('SubscriptionCreated');
    if (!subscriptionCreatedEvent) {
      console.error('Event not found in contract ABI');
      return;
    }

    const decodedLogs = vrfCoordinatorV2_5Mock.interface.decodeEventLog(subscriptionCreatedEvent, logs[0].data, logs[0].topics);
    const subscriptionId = BigInt(decodedLogs[0]);

    await vrfCoordinatorV2_5Mock['fundSubscription'](subscriptionId, BigInt('100000000000000000000'));

    const MockTokenFactory = await ethers.getContractFactory('MockToken');
    const mockToken = await MockTokenFactory.deploy(admin.address);
    await mockToken.waitForDeployment();

    const initialSupply = ethers.parseUnits('1000', 18);
    await mockToken.connect(admin)['mint'](admin.address, initialSupply);
    await mockToken.connect(admin)['mint'](user1.address, initialSupply);
    await mockToken.connect(admin)['mint'](user2.address, ethers.parseUnits('0.01', 18));
    await mockToken.connect(admin)['mint'](user3.address, initialSupply);

    const DateTimeContractFactory = await ethers.getContractFactory('DateTimeContract');
    const dateTimeContract = await DateTimeContractFactory.deploy();

    const LuckyPositionFactory = await ethers.getContractFactory('LuckyPosition');
    const luckyPosition = await LuckyPositionFactory.deploy();

    const vrfCoordinator = vrfCoordinatorV2_5Mock.getAddress();
    const keyHash = '0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae';

    await luckyPosition['initialize'](
      vrfCoordinator,
      keyHash,
      subscriptionId,
      await mockToken.getAddress(),
      await dateTimeContract.getAddress(),
    );

    await vrfCoordinatorV2_5Mock['addConsumer'](subscriptionId, luckyPosition.getAddress());

    const ticketPrice = ethers.parseUnits('1', 18);
    const duration = 3600;
    await luckyPosition.connect(admin)['setGameParams'](ticketPrice, duration);

    await network.provider.send('evm_increaseTime', [14400]);
    await network.provider.send('evm_mine');

    const pauseTimestamp = 1736553599;
    await luckyPosition.connect(admin)['setPauseTime'](pauseTimestamp);
    const resumeTimestamp = 1736485199;
    await luckyPosition.connect(admin)['setResumeTime'](resumeTimestamp);

    await luckyPosition.connect(admin)['setForwarder'](forwarder);

    await luckyPosition.connect(admin)['createGame'](ticketPrice, duration);

    const game = await luckyPosition['games'](await luckyPosition['gameCounter']());
    console.log(game.endTime);

    return {
      luckyPosition,
      vrfCoordinatorV2_5Mock,
      keyHash,
      subscriptionId,
      mockToken,
      dateTimeContract,
      ticketPrice,
      duration,
      admin,
      user1,
      user2,
      user3,
      forwarder,
    };
  }

  it('Should set fee percentage when called by admin', async function () {
    const { luckyPosition, admin } = await loadFixture(setup);
    const newFeePercentage = 10;

    await luckyPosition.connect(admin)['setFeePercentage'](newFeePercentage);

    expect(await luckyPosition['feePercentage']()).to.equal(newFeePercentage);
  });

  it('Should revert if fee percentage is too high', async function () {
    const { luckyPosition, admin } = await loadFixture(setup);

    const highFeePercentage = 21;

    await expect(luckyPosition.connect(admin).setFeePercentage(highFeePercentage)).to.be.revertedWith('Fee percentage too high');
  });

  it('Should revert if fee percentage is negative', async function () {
    const { luckyPosition, admin } = await loadFixture(setup);

    const negativeFeePercentage = 0;

    await expect(luckyPosition.connect(admin).setFeePercentage(negativeFeePercentage)).to.be.revertedWith(
      'Fee percentage not valid',
    );
  });

  it('Should not allow non-admin to set fee percentage', async function () {
    const { luckyPosition, user1 } = await loadFixture(setup);

    const newFeePercentage = 10;

    await expect(luckyPosition.connect(user1).setFeePercentage(newFeePercentage)).to.be.revertedWith('Only callable by owner');
  });

  it('Should emit FeeUpdated event when fee percentage is set', async function () {
    const { luckyPosition, admin } = await loadFixture(setup);

    const newFeePercentage = 10;

    await expect(luckyPosition.connect(admin).setFeePercentage(newFeePercentage))
      .to.emit(luckyPosition, 'FeeUpdated')
      .withArgs(newFeePercentage);
  });

  it('Should set default game parameters when called by admin', async function () {
    const { luckyPosition, admin } = await loadFixture(setup);

    const newTicketPrice = ethers.parseUnits('1', 18);
    const newDuration = 3600;

    await luckyPosition.connect(admin).setGameParams(newTicketPrice, newDuration);

    const ticketPrice = await luckyPosition.ticketPrice();
    const duration = await luckyPosition.duration();

    expect(newTicketPrice).to.equal(ticketPrice);
    expect(newDuration).to.equal(duration);
  });

  it('Should revert if ticket price is 0', async function () {
    const { luckyPosition, admin } = await loadFixture(setup);

    const ticketPrice = 0;
    const duration = 3600;

    await expect(luckyPosition.connect(admin).setGameParams(ticketPrice, duration)).to.be.revertedWith(
      'Ticket price must be greater than 0',
    );
  });

  it('Should revert if duration is 0', async function () {
    const { luckyPosition, admin } = await loadFixture(setup);

    const ticketPrice = ethers.parseUnits('1', 18);
    const duration = 0;

    await expect(luckyPosition.connect(admin).setGameParams(ticketPrice, duration)).to.be.revertedWith(
      'Duration must be greater than 0 and less than or equal to 2 hours',
    );
  });

  it('Should not allow non-admin to set default game parameters', async function () {
    const { luckyPosition, user1 } = await loadFixture(setup);

    const ticketPrice = ethers.parseUnits('1', 18);
    const duration = 3600;

    await expect(luckyPosition.connect(user1).setGameParams(ticketPrice, duration)).to.be.revertedWith('Only callable by owner');
  });

  it('Should emit GameParamsUpdated event when parameters are set', async function () {
    const { luckyPosition, admin } = await loadFixture(setup);

    const ticketPrice = ethers.parseUnits('1', 18);
    const duration = 3600;

    await expect(luckyPosition.connect(admin).setGameParams(ticketPrice, duration))
      .to.emit(luckyPosition, 'GameParamsUpdated')
      .withArgs(ticketPrice, duration);
  });

  it('Should set VRF parameters when called by admin', async function () {
    const { luckyPosition, admin } = await loadFixture(setup);

    const newVrfCoordinator = '0x1234567890AbcdEF1234567890aBcdef12345678';
    const newKeyHash = ethers.randomBytes(32);

    const newSubscriptionId = '12345';

    await luckyPosition.connect(admin).setVRFParameters(newSubscriptionId, newVrfCoordinator, newKeyHash);

    const currentVrfCoordinator = await luckyPosition.vrfCoordinator();
    const currentKeyHash = await luckyPosition.keyHash();
    const currentSubscriptionId = await luckyPosition.chainlinkSubscriptionId();

    expect(currentVrfCoordinator).to.equal(newVrfCoordinator);
    expect(currentKeyHash).to.equal(ethers.hexlify(newKeyHash));
    expect(currentSubscriptionId).to.equal(newSubscriptionId);
  });

  it('Should not allow non-admin to set VRF parameters', async function () {
    const { luckyPosition, user1 } = await loadFixture(setup);

    const newVrfCoordinator = '0x1234567890AbcdEF1234567890aBcdef12345678';
    const newKeyHash = ethers.randomBytes(32);
    const newSubscriptionId = '12345';

    await expect(
      luckyPosition.connect(user1).setVRFParameters(newSubscriptionId, newVrfCoordinator, newKeyHash),
    ).to.be.revertedWith('Only callable by owner');
  });

  it('Should emit VRFParametersUpdated event when parameters are set', async function () {
    const { luckyPosition, admin } = await loadFixture(setup);

    const newVrfCoordinator = '0x1234567890AbcdEF1234567890aBcdef12345678';
    const newKeyHash = ethers.randomBytes(32);
    const newSubscriptionId = '12345';

    await expect(luckyPosition.connect(admin).setVRFParameters(newSubscriptionId, newVrfCoordinator, newKeyHash))
      .to.emit(luckyPosition, 'VRFParametersUpdated')
      .withArgs(newSubscriptionId, newVrfCoordinator, newKeyHash);
  });

  it('Should set allowed token when called by admin', async function () {
    const { luckyPosition, admin, mockToken } = await loadFixture(setup);

    await luckyPosition.connect(admin).setAllowedToken(await mockToken.getAddress());

    const allowedToken = await luckyPosition.allowedToken();
    expect(allowedToken).to.equal(await mockToken.getAddress());
  });

  it('Should revert if token address is invalid', async function () {
    const { luckyPosition, admin } = await loadFixture(setup);

    await expect(luckyPosition.connect(admin).setAllowedToken('0x0000000000000000000000000000000000000000')).to.be.revertedWith(
      'Invalid token address',
    );
  });

  it('Should emit AllowedTokenUpdated event when allowed token is set', async function () {
    const { luckyPosition, admin, mockToken } = await loadFixture(setup);

    await expect(luckyPosition.connect(admin).setAllowedToken(await mockToken.getAddress()))
      .to.emit(luckyPosition, 'AllowedTokenUpdated')
      .withArgs(await mockToken.getAddress());
  });

  it('Should set forwarder address when called by admin', async function () {
    const { luckyPosition, admin } = await loadFixture(setup);

    const newForwarder = '0x1234567890AbcdEF1234567890aBcdef12345678';

    await luckyPosition.connect(admin).setForwarder(newForwarder);

    const forwarderAddress = await luckyPosition.forwarderAddress();
    expect(forwarderAddress).to.equal(newForwarder);
  });

  it('Should revert if forwarder address is invalid', async function () {
    const { luckyPosition, admin } = await loadFixture(setup);

    await expect(luckyPosition.connect(admin).setForwarder('0x0000000000000000000000000000000000000000')).to.be.revertedWith(
      'Invalid forwarder address',
    );
  });

  it('Should not allow non-admin to set allowed token', async function () {
    const { luckyPosition, user1, mockToken } = await loadFixture(setup);

    await expect(luckyPosition.connect(user1).setAllowedToken(await mockToken.getAddress())).to.be.revertedWith(
      'Only callable by owner',
    );
  });

  it('Should not allow non-admin to set forwarder', async function () {
    const { luckyPosition, user1 } = await loadFixture(setup);

    const newForwarder = '0x1234567890abcdef1234567890abcdef12345678';

    await expect(luckyPosition.connect(user1).setForwarder(newForwarder)).to.be.revertedWith('Only callable by owner');
  });

  it('Should set resume time to 5:00:00 AM', async function () {
    const { luckyPosition, admin } = await loadFixture(setup);

    const resumeTimestamp = 1736485200;

    await luckyPosition.connect(admin).setResumeTime(resumeTimestamp);

    const resumeHour = await luckyPosition.resumeHour();
    const resumeMinute = await luckyPosition.resumeMinute();
    const resumeSecond = await luckyPosition.resumeSecond();

    expect(resumeHour).to.equal(5);
    expect(resumeMinute).to.equal(0);
    expect(resumeSecond).to.equal(0);
  });

  it('Should set pause time to 11:59:59 PM', async function () {
    const { luckyPosition, admin } = await loadFixture(setup);

    const pauseTimestamp = 1736553599;

    await luckyPosition.connect(admin).setPauseTime(pauseTimestamp);

    const pauseHour = await luckyPosition.pauseHour();
    const pauseMinute = await luckyPosition.pauseMinute();
    const pauseSecond = await luckyPosition.pauseSecond();

    expect(pauseHour).to.equal(23);
    expect(pauseMinute).to.equal(59);
    expect(pauseSecond).to.equal(59);
  });

  it('Should revert if non-admin tries to set resume time', async function () {
    const { luckyPosition, user1 } = await loadFixture(setup);

    const resumeTimestamp = 1704360000;

    await expect(luckyPosition.connect(user1).setResumeTime(resumeTimestamp)).to.be.revertedWith('Only callable by owner');
  });

  it('Should revert if non-admin tries to initialize', async function () {
    const { luckyPosition, vrfCoordinatorV2_5Mock, keyHash, subscriptionId, mockToken, dateTimeContract, user1 } =
      await loadFixture(setup);

    await expect(
      luckyPosition
        .connect(user1)
        .initialize(
          await vrfCoordinatorV2_5Mock.getAddress(),
          keyHash,
          subscriptionId,
          await mockToken.getAddress(),
          await dateTimeContract.getAddress(),
        ),
    ).to.be.revertedWithCustomError(luckyPosition, 'InvalidInitialization');
  });

  it('Should revert if non-admin tries to set pause time', async function () {
    const { luckyPosition, user1 } = await loadFixture(setup);

    const pauseTimestamp = 1704412799;

    await expect(luckyPosition.connect(user1).setPauseTime(pauseTimestamp)).to.be.revertedWith('Only callable by owner');
  });

  it('Should revert if non-forwarder tries to call performUpkeep', async function () {
    const { luckyPosition, user1 } = await loadFixture(setup);

    await expect(luckyPosition.connect(user1).performUpkeep('0x')).to.be.revertedWith('Caller is not the forwarder');
  });

  it('Should allow user get game detail', async function () {
    const { luckyPosition, user1 } = await loadFixture(setup);

    await luckyPosition.connect(user1).getGameDetails(1);
  });

  describe('Create Game', function () {
    it('Should revert createGame when paused', async function () {
      const { luckyPosition, mockToken, admin, duration, ticketPrice } = await loadFixture(setup);

      await luckyPosition.connect(admin).pauseGame();

      await expect(luckyPosition.connect(admin).createGame(100, 3600)).to.be.revertedWithCustomError(
        luckyPosition,
        'EnforcedPause',
      );
    });

    it('Should revert createGame when invalid params', async function () {
      const { luckyPosition, mockToken, admin, duration, ticketPrice } = await loadFixture(setup);

      await expect(luckyPosition.connect(admin).createGame(0, 1)).to.be.revertedWith('Ticket price must be greater than 0');
    });
    it('Should revert createGame by non-admin and non-automation', async function () {
      const { luckyPosition, mockToken, user1, duration, ticketPrice } = await loadFixture(setup);

      await expect(luckyPosition.connect(user1).createGame(0, 1)).to.be.revertedWith('Not authorized');
    });

    it('Should revert if create game outside allowed hours', async function () {
      const { luckyPosition, mockToken, admin, duration, ticketPrice } = await loadFixture(setup);
      console.log(await luckyPosition.getCurrentTime());

      await network.provider.send('evm_increaseTime', [18000]);
      await network.provider.send('evm_mine');

      console.log(await luckyPosition.getCurrentTime());

      await expect(luckyPosition.connect(admin).createGame(ticketPrice, duration)).to.be.revertedWith(
        'Game can only be created during allowed hours',
      );
    });

    it('Should revert if previous game is not ended or failed', async function () {
      const { luckyPosition, mockToken, admin, duration, ticketPrice } = await loadFixture(setup);

      await expect(luckyPosition.connect(admin).createGame(ticketPrice, duration)).to.be.revertedWith(
        'Previous game is not ended yet',
      );
    });
  });
  describe('Pause and Resume game by admin', function () {
    it('Should allow a user to join the game', async function () {
      const { luckyPosition, mockToken, user1, admin } = await loadFixture(setup);

      await expect(luckyPosition.connect(admin).pauseGame()).to.emit(luckyPosition, 'GamePaused');

      const gameCounter = await luckyPosition.gameCounter();
      const game = await luckyPosition.games(gameCounter);

      expect(game.status).to.equal('4');

      const paused = await luckyPosition.paused();
      expect(paused).to.be.true;
    });

    it('Should not allow non-admin to pause the game', async function () {
      const { luckyPosition, user1 } = await loadFixture(setup);

      await expect(luckyPosition.connect(user1).pauseGame()).to.be.revertedWith('Only callable by owner');
    });

    it('Should allow the admin to resume the game', async function () {
      const { luckyPosition, mockToken, user1, admin } = await loadFixture(setup);

      await expect(luckyPosition.connect(admin).pauseGame()).to.emit(luckyPosition, 'GamePaused');

      const gameCounter = await luckyPosition.gameCounter();
      const game = await luckyPosition.games(gameCounter);

      expect(game.status).to.equal(4);

      await expect(luckyPosition.connect(admin).resumeGame()).to.emit(luckyPosition, 'GameResumed');

      const gameAfter = await luckyPosition.games(gameCounter);
      expect(gameAfter.status).to.equal(3);

      const newGameCounter = await luckyPosition.gameCounter();
      expect(newGameCounter).to.equal(gameCounter + BigInt(1));

      const paused = await luckyPosition.paused();
      expect(paused).to.be.false;
    });
    it('Should not allow non-admin to resume the game', async function () {
      const { luckyPosition, user1 } = await loadFixture(setup);

      await expect(luckyPosition.connect(user1).resumeGame()).to.be.revertedWith('Only callable by owner');
    });
    it('Should not resume while admin has not paused the game.', async function () {
      const { luckyPosition, admin } = await loadFixture(setup);

      await expect(luckyPosition.connect(admin).resumeGame()).to.be.revertedWith('Game must be paused by admin to resume');
    });
  });

  describe('Join Game', function () {
    it('Should allow a user to join the game', async function () {
      const { luckyPosition, mockToken, user1 } = await loadFixture(setup);

      const ticketPrice = await luckyPosition.ticketPrice();
      await mockToken.connect(user1).approve(luckyPosition.getAddress(), ticketPrice);
      const playerId = await luckyPosition.playerTickets.length;
      const latestBlock = await ethers.provider.getBlock("latest");
      const currentTimestamp = latestBlock?.timestamp ?? 0;

      await luckyPosition.connect(user1).joinGame();

      const hasJoined = await luckyPosition.hasJoined(await luckyPosition.gameCounter(), user1.address);
      expect(hasJoined).to.be.true;
      expect(await luckyPosition.getPlayers()).to.include(user1.address);
      const game = await luckyPosition.games(await luckyPosition.gameCounter());
      expect(game.totalPool).to.equal(ticketPrice);
    });

    it('Should revert if the user has already joined the game', async function () {
      const { luckyPosition, mockToken, user1 } = await loadFixture(setup);

      const ticketPrice = await luckyPosition.ticketPrice();
      await mockToken.connect(user1).approve(luckyPosition.getAddress(), ticketPrice);

      await luckyPosition.connect(user1).joinGame();

      await expect(luckyPosition.connect(user1).joinGame()).to.be.revertedWith('Player already joined the game');
    });

    it('Should revert if the game is not active', async function () {
      const { luckyPosition, mockToken, user1, admin, forwarder, user3 } = await loadFixture(setup);
      await luckyPosition.connect(admin).pauseGame();
      // console.log(await luckyPosition.getCurrentTime());

      await network.provider.send('evm_increaseTime', [13400]);
      await network.provider.send('evm_mine');
      // console.log(await luckyPosition.getCurrentTime());

      await luckyPosition.connect(admin).resumeGame();
      console.log(await luckyPosition.getCurrentTime());

      const ticketPrice = await luckyPosition.ticketPrice();

      await mockToken.connect(user3).approve(luckyPosition.getAddress(), ticketPrice);
      await luckyPosition.connect(user3).joinGame();

      await network.provider.send('evm_increaseTime', [3500]);
      await network.provider.send('evm_mine');
      console.log(await luckyPosition.getCurrentTime());

      const [upkeepNeeded, performData] = await luckyPosition.checkUpkeep('0x');

      const decodedData = ethers.toUtf8String(performData).replace(/\0/g, '');
      const cleanedData = decodedData.replace(/[^a-zA-Z]/g, '');

      expect(upkeepNeeded).to.be.true;
      expect(cleanedData).to.equal('pauseGame');

      const gameCounter = await luckyPosition.gameCounter();

      await luckyPosition.connect(forwarder).performUpkeep(performData);

      await mockToken.connect(user1).approve(luckyPosition.getAddress(), ticketPrice);

      await expect(luckyPosition.connect(user1).joinGame()).to.be.revertedWith('Game is not active');
    });

    it('Should revert if the game has ended', async function () {
      const { luckyPosition, mockToken, user1 } = await loadFixture(setup);

      const ticketPrice = await luckyPosition.ticketPrice();
      await mockToken.connect(user1).approve(luckyPosition.getAddress(), ticketPrice);

      await network.provider.send('evm_increaseTime', [3601]);
      await network.provider.send('evm_mine');

      await expect(luckyPosition.connect(user1).joinGame()).to.be.revertedWith('Game has ended');
    });

    it('Should revert if the game is not within allowed hours', async function () {
      const { luckyPosition, vrfCoordinatorV2_5Mock, mockToken, admin, user1, user3, forwarder, keyHash, subscriptionId } =
        await loadFixture(setup);

      await luckyPosition.connect(admin).pauseGame();

      await network.provider.send('evm_increaseTime', [13400]);
      await network.provider.send('evm_mine');

      await luckyPosition.connect(admin).resumeGame();

      await network.provider.send('evm_increaseTime', [3500]);
      await network.provider.send('evm_mine');
      console.log(await luckyPosition.getCurrentTime());
      
      const ticketPrice = await luckyPosition.ticketPrice();
      await mockToken.connect(user1).approve(luckyPosition.getAddress(), ticketPrice);

      await expect(luckyPosition.connect(user1).joinGame()).to.be.revertedWith('User can joined during allowed hours');
    });

    it('Should revert if user has not approved enough tokens', async function () {
      const { luckyPosition, mockToken, user1 } = await loadFixture(setup);

      await expect(luckyPosition.connect(user1).joinGame()).to.be.revertedWith('Insufficient token allowance');
    });

    it('Should revert if token transfer fails', async function () {
      const { luckyPosition, mockToken, user2 } = await loadFixture(setup);

      const ticketPrice = await luckyPosition.ticketPrice();
      await mockToken.connect(user2).approve(luckyPosition.getAddress(), ticketPrice);

      await mockToken.setTransferShouldFail(true);
      await expect(luckyPosition.connect(user2).joinGame()).to.be.revertedWith('Token transfer failed');
    });
    it('Should revert if the contract is paused', async function () {
      const { luckyPosition, mockToken, user1, admin } = await loadFixture(setup);

      await expect(luckyPosition.connect(admin).pauseGame()).to.emit(luckyPosition, 'GamePaused');

      await expect(luckyPosition.connect(user1).joinGame()).to.be.revertedWithCustomError(luckyPosition, 'EnforcedPause');
    });
  });

  describe('checkUpkeep and performUpkeep', function () {
    it("Should return upkeepNeeded as true with performData 'endGame' when game has ended", async function () {
      const { luckyPosition, vrfCoordinatorV2_5Mock, mockToken, admin, user1, user3, forwarder, keyHash, subscriptionId } =
        await loadFixture(setup);

      const ticketPrice = await luckyPosition.ticketPrice();

      await mockToken.connect(user1).approve(luckyPosition.getAddress(), ticketPrice);
      await luckyPosition.connect(user1).joinGame();
      await mockToken.connect(user3).approve(luckyPosition.getAddress(), ticketPrice);
      await luckyPosition.connect(user3).joinGame();

      await network.provider.send('evm_increaseTime', [3600]);
      await network.provider.send('evm_mine');

      const [upkeepNeeded, performData] = await luckyPosition.checkUpkeep('0x');

      const decodedData = ethers.toUtf8String(performData).replace(/\0/g, '');
      const cleanedData = decodedData.replace(/[^a-zA-Z]/g, '');

      expect(upkeepNeeded).to.be.true;
      expect(cleanedData).to.equal('endGame');

      const lastGameCounter = await luckyPosition.gameCounter();

      const tx = await luckyPosition.connect(forwarder).performUpkeep(performData);

      const receipt = await tx.wait();
      const logs = receipt.logs;
      const randomWordsRequestedEvent = vrfCoordinatorV2_5Mock.interface.getEvent('RandomWordsRequested');

      if (!randomWordsRequestedEvent) {
        console.error('Event not found in contract ABI');
        return;
      }
      const decodedLogs = vrfCoordinatorV2_5Mock.interface.decodeEventLog(
        randomWordsRequestedEvent,
        logs[0].data,
        logs[0].topics,
      );
      const requestId = BigInt(decodedLogs[1]);

      await vrfCoordinatorV2_5Mock.fulfillRandomWords(requestId, await luckyPosition.getAddress());

      const game = await luckyPosition.games(lastGameCounter);

      expect(game.status).to.equal(0);

      const winner = game.winner;
      expect([user1.address, user3.address]).to.include(winner);

      const gameCounterAfter = await luckyPosition.gameCounter();
      expect(gameCounterAfter).to.equal(lastGameCounter + BigInt(1));
    });

    it('Should revert if non admin call requestRandomWordsFromContract ', async function () {
      const { luckyPosition, admin, user1, keyHash, subscriptionId } = await loadFixture(setup);

      luckyPosition.connect(admin).requestRandomWordsFromContract(keyHash, subscriptionId, 3, 1000000, 1);
      expect(
        luckyPosition.connect(user1).requestRandomWordsFromContract(keyHash, subscriptionId, 3, 1000000, 1),
      ).to.be.revertedWith('Only callable by owner');
    });
    it('Should revert if requestRandomWordsFromContract while game not ended', async function () {
      const { luckyPosition, admin, user1, keyHash, subscriptionId } = await loadFixture(setup);

      luckyPosition.connect(admin).requestRandomWordsFromContract(keyHash, subscriptionId, 3, 1000000, 1);
      expect(
        luckyPosition.connect(user1).requestRandomWordsFromContract(keyHash, subscriptionId, 3, 1000000, 1),
      ).to.be.revertedWith('Game is not ended');
    });

    it('should handle failed random number request in endGame', async function () {
      const { luckyPosition, vrfCoordinatorV2_5Mock, mockToken, admin, user1, forwarder, keyHash, subscriptionId } =
        await loadFixture(setup);

      const ticketPrice = await luckyPosition.ticketPrice();

      await mockToken.connect(user1).approve(luckyPosition.getAddress(), ticketPrice);
      await luckyPosition.connect(user1).joinGame();

      await network.provider.send('evm_increaseTime', [3600]);
      await network.provider.send('evm_mine');

      const [upkeepNeeded, performData] = await luckyPosition.checkUpkeep('0x');

      const decodedData = ethers.toUtf8String(performData).replace(/\0/g, '');
      const cleanedData = decodedData.replace(/[^a-zA-Z]/g, '');

      expect(upkeepNeeded).to.be.true;
      expect(cleanedData).to.equal('endGame');

      const newVrfCoordinator = '0x1234567890AbcdEF1234567890aBcdef12345678';
      const newKeyHash = ethers.randomBytes(32);
      const newSubscriptionId = '12345';
      await luckyPosition.connect(admin).setVRFParameters(newSubscriptionId, newVrfCoordinator, newKeyHash);

      const gameId = await luckyPosition.gameCounter();
      await luckyPosition.connect(forwarder).performUpkeep(performData);

      const game = await luckyPosition.games(gameId);
      expect(game.status).to.equal(3);

      const gameAfter = await luckyPosition.games(await luckyPosition.gameCounter());
      expect(gameAfter.status).to.equal(1);
    });

    it('Should revert if call checkUpkeep when game paused', async function () {
      const { luckyPosition, admin, user1, keyHash, subscriptionId } = await loadFixture(setup);

      await luckyPosition.connect(admin).pauseGame();
      await expect(luckyPosition.connect(user1).checkUpkeep('0x')).to.be.revertedWithCustomError(luckyPosition, 'EnforcedPause');
    });

    it('Should revert if non forwarder call performUpkeep ', async function () {
      const { luckyPosition, admin, user1, keyHash, subscriptionId } = await loadFixture(setup);

      const [upkeepNeeded, performData] = await luckyPosition.checkUpkeep('0x');

      const decodedData = ethers.toUtf8String(performData).replace(/\0/g, '');
      const cleanedData = decodedData.replace(/[^a-zA-Z]/g, '');

      expect(luckyPosition.connect(user1).performUpkeep(performData)).to.be.revertedWith('Caller is not the forwarder');
    });


    it("Should return upkeepNeeded as true with performData 'pause' and performUpkeep pause game", async function () {
      const { luckyPosition, vrfCoordinatorV2_5Mock, mockToken, admin, user1, user3, forwarder, keyHash, subscriptionId } =
        await loadFixture(setup);

      await luckyPosition.connect(admin).pauseGame();
      // console.log(await luckyPosition.getCurrentTime());

      await network.provider.send('evm_increaseTime', [13400]);
      await network.provider.send('evm_mine');

      await luckyPosition.connect(admin).resumeGame();
      console.log(await luckyPosition.getCurrentTime());

      const ticketPrice = await luckyPosition.ticketPrice();

      await mockToken.connect(user1).approve(luckyPosition.getAddress(), ticketPrice);
      await luckyPosition.connect(user1).joinGame();
      await mockToken.connect(user3).approve(luckyPosition.getAddress(), ticketPrice);
      await luckyPosition.connect(user3).joinGame();

      await network.provider.send('evm_increaseTime', [3500]);
      await network.provider.send('evm_mine');
      console.log(await luckyPosition.getCurrentTime());

      const [upkeepNeeded, performData] = await luckyPosition.checkUpkeep('0x');

      const decodedData = ethers.toUtf8String(performData).replace(/\0/g, '');
      const cleanedData = decodedData.replace(/[^a-zA-Z]/g, '');

      expect(upkeepNeeded).to.be.true;
      expect(cleanedData).to.equal('pauseGame');

      const gameCounter = await luckyPosition.gameCounter();

      await luckyPosition.connect(forwarder).performUpkeep(performData);

      const game = await luckyPosition.games(gameCounter);

      expect(game.status).to.equal(2);
    });

    it("Should return upkeepNeeded as true with performData 'resume' and performUpkeep resume game", async function () {
      const { luckyPosition, vrfCoordinatorV2_5Mock, mockToken, admin, user1, user3, forwarder, keyHash, subscriptionId } =
        await loadFixture(setup);

      await luckyPosition.connect(admin).pauseGame();

      await network.provider.send('evm_increaseTime', [13400]);
      await network.provider.send('evm_mine');
      // console.log(await luckyPosition.getCurrentTime());

      await luckyPosition.connect(admin).resumeGame();
      // console.log(await luckyPosition.getCurrentTime());

      const ticketPrice = await luckyPosition.ticketPrice();

      await mockToken.connect(user1).approve(luckyPosition.getAddress(), ticketPrice);
      await luckyPosition.connect(user1).joinGame();
      await mockToken.connect(user3).approve(luckyPosition.getAddress(), ticketPrice);
      await luckyPosition.connect(user3).joinGame();

      await network.provider.send('evm_increaseTime', [3500]);
      await network.provider.send('evm_mine');
      // console.log(await luckyPosition.getCurrentTime());

      const [upkeepNeeded, performData] = await luckyPosition.checkUpkeep('0x');

      const decodedData = ethers.toUtf8String(performData).replace(/\0/g, '');
      const cleanedData = decodedData.replace(/[^a-zA-Z]/g, '');

      expect(upkeepNeeded).to.be.true;
      expect(cleanedData).to.equal('pauseGame');

      const gameCounter = await luckyPosition.gameCounter();

      await luckyPosition.connect(forwarder).performUpkeep(performData);

      const game = await luckyPosition.games(gameCounter);

      expect(game.status).to.equal(2);

      await network.provider.send('evm_increaseTime', [18000]);
      await network.provider.send('evm_mine');

      const [upkeepNeeded2, performData2] = await luckyPosition.checkUpkeep('0x');

      const decodedData2 = ethers.toUtf8String(performData2).replace(/\0/g, '');
      const cleanedData2 = decodedData2.replace(/[^a-zA-Z]/g, '');

      expect(upkeepNeeded2).to.be.true;
      expect(cleanedData2).to.equal('resumeGame');

      await luckyPosition.connect(forwarder).performUpkeep(performData2);

      const gameAfter = await luckyPosition.games(gameCounter);

      expect(gameAfter.status).to.equal(1);
    });
  });

  describe('Claim Refund', function () {
    it('Should allow user to claim refund for failed games', async function () {
      const { luckyPosition, mockToken, user1, admin } = await loadFixture(setup);

      const ticketPrice = await luckyPosition.ticketPrice();
      await mockToken.connect(user1).approve(luckyPosition.getAddress(), ticketPrice);

      await luckyPosition.connect(user1).joinGame();

      const initialBalance = await mockToken.balanceOf(user1.address);

      await luckyPosition.connect(admin).pauseGame();
      await luckyPosition.connect(admin).resumeGame();

      const gameIds = [1];

      await luckyPosition.connect(user1).claimRefund(gameIds);

      const finalBalance = await mockToken.balanceOf(user1.address);

      expect(finalBalance).to.equal(initialBalance + ticketPrice);
    });

    it('Should revert if user claim refund for game user not participate in', async function () {
      const { luckyPosition, mockToken, user1, admin } = await loadFixture(setup);

      const ticketPrice = await luckyPosition.ticketPrice();
      await mockToken.connect(user1).approve(luckyPosition.getAddress(), ticketPrice);

      await luckyPosition.connect(user1).joinGame();

      const initialBalance = await mockToken.balanceOf(user1.address);

      await luckyPosition.connect(admin).pauseGame();
      await luckyPosition.connect(admin).resumeGame();

      const gameIds = [2];

      await expect(luckyPosition.connect(user1).claimRefund(gameIds)).to.be.revertedWith('You did not participate in this game');
    });

    it('Should revert if game did not failed', async function () {
      const { luckyPosition, mockToken, user1, admin } = await loadFixture(setup);

      const ticketPrice = await luckyPosition.ticketPrice();
      await mockToken.connect(user1).approve(luckyPosition.getAddress(), ticketPrice);

      await luckyPosition.connect(user1).joinGame();

      const initialBalance = await mockToken.balanceOf(user1.address);

      const gameIds = [1];

      await expect(luckyPosition.connect(user1).claimRefund(gameIds)).to.be.revertedWith('Game did not fail');
    });

    it('Should revert if user already claimed refund', async function () {
      const { luckyPosition, mockToken, user1, admin } = await loadFixture(setup);

      const ticketPrice = await luckyPosition.ticketPrice();
      await mockToken.connect(user1).approve(luckyPosition.getAddress(), ticketPrice);

      await luckyPosition.connect(user1).joinGame();

      const initialBalance = await mockToken.balanceOf(user1.address);

      await luckyPosition.connect(admin).pauseGame();
      await luckyPosition.connect(admin).resumeGame();

      const gameIds = [1];

      await luckyPosition.connect(user1).claimRefund(gameIds);
      await expect(luckyPosition.connect(user1).claimRefund(gameIds)).to.be.revertedWith('Refund already claimed for this game');
    });
  });

  describe('With draw fee', function () {
    it('Should allow user to claim refund for failed games', async function () {
      const { luckyPosition, vrfCoordinatorV2_5Mock, mockToken, admin, user1, user3, forwarder, keyHash, subscriptionId } =
        await loadFixture(setup);

      const ticketPrice = await luckyPosition.ticketPrice();

      await mockToken.connect(user1).approve(luckyPosition.getAddress(), ticketPrice);
      await luckyPosition.connect(user1).joinGame();
      await mockToken.connect(user3).approve(luckyPosition.getAddress(), ticketPrice);
      await luckyPosition.connect(user3).joinGame();

      await network.provider.send('evm_increaseTime', [3600]);
      await network.provider.send('evm_mine');

      const [upkeepNeeded, performData] = await luckyPosition.checkUpkeep('0x');

      const decodedData = ethers.toUtf8String(performData).replace(/\0/g, '');
      const cleanedData = decodedData.replace(/[^a-zA-Z]/g, '');

      expect(upkeepNeeded).to.be.true;
      expect(cleanedData).to.equal('endGame');

      const lastGameCounter = await luckyPosition.gameCounter();

      const tx = await luckyPosition.connect(forwarder).performUpkeep(performData);

      const receipt = await tx.wait();
      const logs = receipt.logs;
      const randomWordsRequestedEvent = vrfCoordinatorV2_5Mock.interface.getEvent('RandomWordsRequested');

      if (!randomWordsRequestedEvent) {
        console.error('Event not found in contract ABI');
        return;
      }
      const decodedLogs = vrfCoordinatorV2_5Mock.interface.decodeEventLog(
        randomWordsRequestedEvent,
        logs[0].data,
        logs[0].topics,
      );
      const requestId = BigInt(decodedLogs[1]);

      await vrfCoordinatorV2_5Mock.fulfillRandomWords(requestId, await luckyPosition.getAddress());

      const initialBalance = await mockToken.balanceOf(admin.address);
      const collectedFee = await luckyPosition.collectedFee();

      await luckyPosition.connect(admin).withDrawFee();

      const finalBalance = await mockToken.balanceOf(admin.address);

      expect(finalBalance).to.equal(initialBalance + collectedFee);
    });

    it('Should revert if non admin with draw fee', async function () {
      const { luckyPosition, vrfCoordinatorV2_5Mock, mockToken, admin, user1, user3, forwarder, keyHash, subscriptionId } =
        await loadFixture(setup);

      await expect(luckyPosition.connect(user1).withDrawFee()).to.be.revertedWith('Only callable by owner');
    });

    it('Should revert if no fee available to withdraw', async function () {
      const { luckyPosition, vrfCoordinatorV2_5Mock, mockToken, admin, user1, user3, forwarder, keyHash, subscriptionId } =
        await loadFixture(setup);

      await expect(luckyPosition.connect(admin).withDrawFee()).to.be.revertedWith('No fee available to withdraw');
    });
  });
});
