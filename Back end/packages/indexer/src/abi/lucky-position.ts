import * as p from '@subsquid/evm-codec'
import { event, fun, viewFun, indexed, ContractBase } from '@subsquid/evm-abi'
import type { EventParams as EParams, FunctionArguments, FunctionReturn } from '@subsquid/evm-abi'

export const events = {
    AllowedTokenUpdated: event("0xa59c8073acb6c9ee7673c04ab12a7a29bdb9a6f4e42241752f7c39ac1b93594a", "AllowedTokenUpdated(address)", {"newToken": p.address}),
    CoordinatorSet: event("0xd1a6a14209a385a964d036e404cb5cfb71f4000cdb03c9366292430787261be6", "CoordinatorSet(address)", {"vrfCoordinator": p.address}),
    FeeUpdated: event("0x8c4d35e54a3f2ef1134138fd8ea3daee6a3c89e10d2665996babdf70261e2c76", "FeeUpdated(uint256)", {"newFeePercentage": p.uint256}),
    FeeWithdrawn: event("0x78473f3f373f7673597f4f0fa5873cb4d375fea6d4339ad6b56dbd411513cb3f", "FeeWithdrawn(address,uint256)", {"admin": indexed(p.address), "amount": p.uint256}),
    ForwarderUpdated: event("0x9d90a82ec1d038d4e13317a0eb136f9c65b7ed42156fc204ec4b7c4731e73950", "ForwarderUpdated(address)", {"newForwarder": p.address}),
    GameCreated: event("0x80b55cf2f646df8d85b80ac067c88c4aa6354a860d6cb55c7e234cf23861627f", "GameCreated(uint256,uint256,uint256,uint256)", {"gameId": indexed(p.uint256), "ticketPrice": p.uint256, "startTime": p.uint256, "endTime": p.uint256}),
    GameEnded: event("0xf1898de79c348962fab7695532341027e5bceb0ea2a8785790fa7d7efeeee129", "GameEnded(uint256,address,uint256)", {"gameId": indexed(p.uint256), "winner": indexed(p.address), "totalReward": p.uint256}),
    GameFailed: event("0xf6aa8b4724c300a8e180a516dfbdad52959181554de9f90cf5f44e71be8c3f9b", "GameFailed(uint256)", {"gameId": p.uint256}),
    GameParamsUpdated: event("0xcaab9caa6c394cf248dc02a17ab53f5c5c86cd47b52ee14adcb603f647328b9f", "GameParamsUpdated(uint256,uint128)", {"ticketPrice": p.uint256, "duration": p.uint128}),
    GamePaused: event("0xf5704ea1fb9a06b3c4911041793afd3003eac5b15756eef2987e75303f9f34c6", "GamePaused(uint256,uint256)", {"gameId": indexed(p.uint256), "pausedAt": p.uint256}),
    GameResumed: event("0xf2a114a9aade5d0ffb1e3a061f500edece4d49d01a2c17c97adb7dd1f9ce6f56", "GameResumed(uint256,uint256)", {"gameId": indexed(p.uint256), "resumedAt": p.uint256}),
    Initialized: event("0xc7f505b2f371ae2175ee4913f4499e1f2633a7b5936321eed1cdaeb6115181d2", "Initialized(uint64)", {"version": p.uint64}),
    OwnershipTransferRequested: event("0xed8889f560326eb138920d842192f0eb3dd22b4f139c87a2c57538e05bae1278", "OwnershipTransferRequested(address,address)", {"from": indexed(p.address), "to": indexed(p.address)}),
    OwnershipTransferred: event("0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0", "OwnershipTransferred(address,address)", {"from": indexed(p.address), "to": indexed(p.address)}),
    PauseTimeUpdated: event("0xcd096fca9afb3f34cbf449ed3f888286ce40f2cc581d5fde62a3ea8190ae1d1e", "PauseTimeUpdated(uint256,uint256,uint256)", {"hour": p.uint256, "minute": p.uint256, "second": p.uint256}),
    Paused: event("0x62e78cea01bee320cd4e420270b5ea74000d11b0c9f74754ebdbfc544b05a258", "Paused(address)", {"account": p.address}),
    PlayerJoined: event("0xe482a0d122bd14c029e89682e437b97096a33175ec9d4a3c1fea3973a7b8cc44", "PlayerJoined(uint256,uint256,address,uint256)", {"gameId": indexed(p.uint256), "playerId": indexed(p.uint256), "player": indexed(p.address), "joinedAt": p.uint256}),
    RefundClaimed: event("0x76a727f3b919c5973d7efbd63292de85ad366b085931ffdbf0441bfc4bffcf15", "RefundClaimed(address,uint256,uint256[],uint256)", {"player": indexed(p.address), "amount": p.uint256, "gameIds": p.array(p.uint256), "refundedAt": p.uint256}),
    ResumeTimeUpdated: event("0xf69171fa912a3f354b3df8cdb3dd81cfeba8740704eee7c64b04c05808dd9db0", "ResumeTimeUpdated(uint256,uint256,uint256)", {"hour": p.uint256, "minute": p.uint256, "second": p.uint256}),
    Unpaused: event("0x5db9ee0a495bf2e6ff9c91a7834c1ba4fdd244a5e8aa4e537bd38aeae4b073aa", "Unpaused(address)", {"account": p.address}),
    Upgraded: event("0xbc7cd75a20ee27fd9adebab32041f755214dbc6bffa90cc0225b39da2e5c2d3b", "Upgraded(address)", {"implementation": indexed(p.address)}),
    VRFParametersUpdated: event("0x11c0e7fbf97729619d80d54c7c4b1cbe1b054503caeb11e8841b35ea27c069e1", "VRFParametersUpdated(uint256,address,bytes32)", {"subscriptionId": p.uint256, "vrfCoordinator": p.address, "keyHash": p.bytes32}),
}

export const functions = {
    UPGRADE_INTERFACE_VERSION: viewFun("0xad3cb1cc", "UPGRADE_INTERFACE_VERSION()", {}, p.string),
    acceptOwnership: fun("0x79ba5097", "acceptOwnership()", {}, ),
    allowedToken: viewFun("0x85fa292f", "allowedToken()", {}, p.address),
    chainlinkSubscriptionId: viewFun("0x20c5780c", "chainlinkSubscriptionId()", {}, p.uint256),
    checkUpkeep: viewFun("0x6e04ff0d", "checkUpkeep(bytes)", {"_0": p.bytes}, {"upkeepNeeded": p.bool, "performData": p.bytes}),
    claimRefund: fun("0xf54a6f83", "claimRefund(uint256[])", {"_gameIds": p.array(p.uint256)}, ),
    collectedFee: viewFun("0xe811f50a", "collectedFee()", {}, p.uint256),
    createGame: fun("0x1984cb56", "createGame(uint256,uint128)", {"_ticketPrice": p.uint256, "_duration": p.uint128}, ),
    dateTimeContract: viewFun("0x205cd37b", "dateTimeContract()", {}, p.address),
    duration: viewFun("0x0fb5a6b4", "duration()", {}, p.uint128),
    feePercentage: viewFun("0xa001ecdd", "feePercentage()", {}, p.uint256),
    forwarderAddress: viewFun("0x174ab889", "forwarderAddress()", {}, p.address),
    gameCounter: viewFun("0x2e0be39a", "gameCounter()", {}, p.uint256),
    games: viewFun("0x117a5b90", "games(uint256)", {"_0": p.uint256}, {"ticketPrice": p.uint256, "totalPool": p.uint256, "winner": p.address, "status": p.uint8, "startTime": p.uint256, "endTime": p.uint256}),
    getCurrentTime: viewFun("0x29cb924d", "getCurrentTime()", {}, {"_0": p.uint256, "_1": p.uint256, "_2": p.uint256}),
    getGameDetails: viewFun("0x1b31abda", "getGameDetails(uint256)", {"_gameId": p.uint256}, p.struct({"ticketPrice": p.uint256, "totalPool": p.uint256, "winner": p.address, "status": p.uint8, "startTime": p.uint256, "endTime": p.uint256})),
    getPlayers: viewFun("0x8b5b9ccc", "getPlayers()", {}, p.array(p.address)),
    hasClaimedRefund: viewFun("0xb154afc3", "hasClaimedRefund(uint256,address)", {"_0": p.uint256, "_1": p.address}, p.bool),
    hasJoined: viewFun("0x68194719", "hasJoined(uint256,address)", {"_0": p.uint256, "_1": p.address}, p.bool),
    initialize: fun("0x0af5a263", "initialize(address,bytes32,uint256,address,address)", {"_vrfCoordinator": p.address, "_keyHash": p.bytes32, "_subscriptionId": p.uint256, "_allowedToken": p.address, "_dateTimeContract": p.address}, ),
    isWithinActiveTime: viewFun("0x8c9ec5fb", "isWithinActiveTime()", {}, p.bool),
    joinGame: fun("0xd4f77b1c", "joinGame()", {}, ),
    keyHash: viewFun("0x61728f39", "keyHash()", {}, p.bytes32),
    owner: viewFun("0x8da5cb5b", "owner()", {}, p.address),
    pauseGame: fun("0x499831f2", "pauseGame()", {}, ),
    pauseHour: viewFun("0x6c91d12f", "pauseHour()", {}, p.uint256),
    pauseMinute: viewFun("0x69a84375", "pauseMinute()", {}, p.uint256),
    pauseSecond: viewFun("0x14c962cd", "pauseSecond()", {}, p.uint256),
    paused: viewFun("0x5c975abb", "paused()", {}, p.bool),
    performUpkeep: fun("0x4585e33b", "performUpkeep(bytes)", {"performData": p.bytes}, ),
    playerTickets: viewFun("0xa231b484", "playerTickets(uint256)", {"_0": p.uint256}, p.address),
    proxiableUUID: viewFun("0x52d1902d", "proxiableUUID()", {}, p.bytes32),
    rawFulfillRandomWords: fun("0x1fe543e3", "rawFulfillRandomWords(uint256,uint256[])", {"requestId": p.uint256, "randomWords": p.array(p.uint256)}, ),
    requestIdToGameId: viewFun("0x1fa072db", "requestIdToGameId(uint256)", {"_0": p.uint256}, p.uint256),
    requestRandomWordsFromContract: fun("0x80e2ac0b", "requestRandomWordsFromContract(bytes32,uint256,uint16,uint32,uint32)", {"_keyHash": p.bytes32, "_chainlinkSubscriptionId": p.uint256, "_requestConfirmations": p.uint16, "_callbackGasLimit": p.uint32, "_numWords": p.uint32}, p.uint256),
    resumeGame: fun("0x3cc4c6ce", "resumeGame()", {}, ),
    resumeHour: viewFun("0x2ee17b25", "resumeHour()", {}, p.uint256),
    resumeMinute: viewFun("0x542d8779", "resumeMinute()", {}, p.uint256),
    resumeSecond: viewFun("0x1dcfcc69", "resumeSecond()", {}, p.uint256),
    s_vrfCoordinator: viewFun("0x9eccacf6", "s_vrfCoordinator()", {}, p.address),
    setAllowedToken: fun("0xb68490bc", "setAllowedToken(address)", {"_token": p.address}, ),
    setCoordinator: fun("0x8ea98117", "setCoordinator(address)", {"_vrfCoordinator": p.address}, ),
    setFeePercentage: fun("0xae06c1b7", "setFeePercentage(uint256)", {"_feePercentage": p.uint256}, ),
    setForwarder: fun("0xb9998a24", "setForwarder(address)", {"_forwarderAddress": p.address}, ),
    setGameParams: fun("0xd9b1299b", "setGameParams(uint256,uint128)", {"_ticketPrice": p.uint256, "_duration": p.uint128}, ),
    setPauseTime: fun("0x84512e83", "setPauseTime(uint256)", {"timestamp": p.uint256}, ),
    setResumeTime: fun("0x5837f941", "setResumeTime(uint256)", {"timestamp": p.uint256}, ),
    setVRFParameters: fun("0x1527b282", "setVRFParameters(uint256,address,bytes32)", {"_subscriptionId": p.uint256, "_vrfCoordinator": p.address, "_keyHash": p.bytes32}, ),
    ticketPrice: viewFun("0x1209b1f6", "ticketPrice()", {}, p.uint256),
    transferOwnership: fun("0xf2fde38b", "transferOwnership(address)", {"to": p.address}, ),
    upgradeToAndCall: fun("0x4f1ef286", "upgradeToAndCall(address,bytes)", {"newImplementation": p.address, "data": p.bytes}, ),
    vrfCoordinator: viewFun("0xa3e56fa8", "vrfCoordinator()", {}, p.address),
    withDrawFee: fun("0xeea5bf4b", "withDrawFee()", {}, ),
}

export class Contract extends ContractBase {

    UPGRADE_INTERFACE_VERSION() {
        return this.eth_call(functions.UPGRADE_INTERFACE_VERSION, {})
    }

    allowedToken() {
        return this.eth_call(functions.allowedToken, {})
    }

    chainlinkSubscriptionId() {
        return this.eth_call(functions.chainlinkSubscriptionId, {})
    }

    checkUpkeep(_0: CheckUpkeepParams["_0"]) {
        return this.eth_call(functions.checkUpkeep, {_0})
    }

    collectedFee() {
        return this.eth_call(functions.collectedFee, {})
    }

    dateTimeContract() {
        return this.eth_call(functions.dateTimeContract, {})
    }

    duration() {
        return this.eth_call(functions.duration, {})
    }

    feePercentage() {
        return this.eth_call(functions.feePercentage, {})
    }

    forwarderAddress() {
        return this.eth_call(functions.forwarderAddress, {})
    }

    gameCounter() {
        return this.eth_call(functions.gameCounter, {})
    }

    games(_0: GamesParams["_0"]) {
        return this.eth_call(functions.games, {_0})
    }

    getCurrentTime() {
        return this.eth_call(functions.getCurrentTime, {})
    }

    getGameDetails(_gameId: GetGameDetailsParams["_gameId"]) {
        return this.eth_call(functions.getGameDetails, {_gameId})
    }

    getPlayers() {
        return this.eth_call(functions.getPlayers, {})
    }

    hasClaimedRefund(_0: HasClaimedRefundParams["_0"], _1: HasClaimedRefundParams["_1"]) {
        return this.eth_call(functions.hasClaimedRefund, {_0, _1})
    }

    hasJoined(_0: HasJoinedParams["_0"], _1: HasJoinedParams["_1"]) {
        return this.eth_call(functions.hasJoined, {_0, _1})
    }

    isWithinActiveTime() {
        return this.eth_call(functions.isWithinActiveTime, {})
    }

    keyHash() {
        return this.eth_call(functions.keyHash, {})
    }

    owner() {
        return this.eth_call(functions.owner, {})
    }

    pauseHour() {
        return this.eth_call(functions.pauseHour, {})
    }

    pauseMinute() {
        return this.eth_call(functions.pauseMinute, {})
    }

    pauseSecond() {
        return this.eth_call(functions.pauseSecond, {})
    }

    paused() {
        return this.eth_call(functions.paused, {})
    }

    playerTickets(_0: PlayerTicketsParams["_0"]) {
        return this.eth_call(functions.playerTickets, {_0})
    }

    proxiableUUID() {
        return this.eth_call(functions.proxiableUUID, {})
    }

    requestIdToGameId(_0: RequestIdToGameIdParams["_0"]) {
        return this.eth_call(functions.requestIdToGameId, {_0})
    }

    resumeHour() {
        return this.eth_call(functions.resumeHour, {})
    }

    resumeMinute() {
        return this.eth_call(functions.resumeMinute, {})
    }

    resumeSecond() {
        return this.eth_call(functions.resumeSecond, {})
    }

    s_vrfCoordinator() {
        return this.eth_call(functions.s_vrfCoordinator, {})
    }

    ticketPrice() {
        return this.eth_call(functions.ticketPrice, {})
    }

    vrfCoordinator() {
        return this.eth_call(functions.vrfCoordinator, {})
    }
}

/// Event types
export type AllowedTokenUpdatedEventArgs = EParams<typeof events.AllowedTokenUpdated>
export type CoordinatorSetEventArgs = EParams<typeof events.CoordinatorSet>
export type FeeUpdatedEventArgs = EParams<typeof events.FeeUpdated>
export type FeeWithdrawnEventArgs = EParams<typeof events.FeeWithdrawn>
export type ForwarderUpdatedEventArgs = EParams<typeof events.ForwarderUpdated>
export type GameCreatedEventArgs = EParams<typeof events.GameCreated>
export type GameEndedEventArgs = EParams<typeof events.GameEnded>
export type GameFailedEventArgs = EParams<typeof events.GameFailed>
export type GameParamsUpdatedEventArgs = EParams<typeof events.GameParamsUpdated>
export type GamePausedEventArgs = EParams<typeof events.GamePaused>
export type GameResumedEventArgs = EParams<typeof events.GameResumed>
export type InitializedEventArgs = EParams<typeof events.Initialized>
export type OwnershipTransferRequestedEventArgs = EParams<typeof events.OwnershipTransferRequested>
export type OwnershipTransferredEventArgs = EParams<typeof events.OwnershipTransferred>
export type PauseTimeUpdatedEventArgs = EParams<typeof events.PauseTimeUpdated>
export type PausedEventArgs = EParams<typeof events.Paused>
export type PlayerJoinedEventArgs = EParams<typeof events.PlayerJoined>
export type RefundClaimedEventArgs = EParams<typeof events.RefundClaimed>
export type ResumeTimeUpdatedEventArgs = EParams<typeof events.ResumeTimeUpdated>
export type UnpausedEventArgs = EParams<typeof events.Unpaused>
export type UpgradedEventArgs = EParams<typeof events.Upgraded>
export type VRFParametersUpdatedEventArgs = EParams<typeof events.VRFParametersUpdated>

/// Function types
export type UPGRADE_INTERFACE_VERSIONParams = FunctionArguments<typeof functions.UPGRADE_INTERFACE_VERSION>
export type UPGRADE_INTERFACE_VERSIONReturn = FunctionReturn<typeof functions.UPGRADE_INTERFACE_VERSION>

export type AcceptOwnershipParams = FunctionArguments<typeof functions.acceptOwnership>
export type AcceptOwnershipReturn = FunctionReturn<typeof functions.acceptOwnership>

export type AllowedTokenParams = FunctionArguments<typeof functions.allowedToken>
export type AllowedTokenReturn = FunctionReturn<typeof functions.allowedToken>

export type ChainlinkSubscriptionIdParams = FunctionArguments<typeof functions.chainlinkSubscriptionId>
export type ChainlinkSubscriptionIdReturn = FunctionReturn<typeof functions.chainlinkSubscriptionId>

export type CheckUpkeepParams = FunctionArguments<typeof functions.checkUpkeep>
export type CheckUpkeepReturn = FunctionReturn<typeof functions.checkUpkeep>

export type ClaimRefundParams = FunctionArguments<typeof functions.claimRefund>
export type ClaimRefundReturn = FunctionReturn<typeof functions.claimRefund>

export type CollectedFeeParams = FunctionArguments<typeof functions.collectedFee>
export type CollectedFeeReturn = FunctionReturn<typeof functions.collectedFee>

export type CreateGameParams = FunctionArguments<typeof functions.createGame>
export type CreateGameReturn = FunctionReturn<typeof functions.createGame>

export type DateTimeContractParams = FunctionArguments<typeof functions.dateTimeContract>
export type DateTimeContractReturn = FunctionReturn<typeof functions.dateTimeContract>

export type DurationParams = FunctionArguments<typeof functions.duration>
export type DurationReturn = FunctionReturn<typeof functions.duration>

export type FeePercentageParams = FunctionArguments<typeof functions.feePercentage>
export type FeePercentageReturn = FunctionReturn<typeof functions.feePercentage>

export type ForwarderAddressParams = FunctionArguments<typeof functions.forwarderAddress>
export type ForwarderAddressReturn = FunctionReturn<typeof functions.forwarderAddress>

export type GameCounterParams = FunctionArguments<typeof functions.gameCounter>
export type GameCounterReturn = FunctionReturn<typeof functions.gameCounter>

export type GamesParams = FunctionArguments<typeof functions.games>
export type GamesReturn = FunctionReturn<typeof functions.games>

export type GetCurrentTimeParams = FunctionArguments<typeof functions.getCurrentTime>
export type GetCurrentTimeReturn = FunctionReturn<typeof functions.getCurrentTime>

export type GetGameDetailsParams = FunctionArguments<typeof functions.getGameDetails>
export type GetGameDetailsReturn = FunctionReturn<typeof functions.getGameDetails>

export type GetPlayersParams = FunctionArguments<typeof functions.getPlayers>
export type GetPlayersReturn = FunctionReturn<typeof functions.getPlayers>

export type HasClaimedRefundParams = FunctionArguments<typeof functions.hasClaimedRefund>
export type HasClaimedRefundReturn = FunctionReturn<typeof functions.hasClaimedRefund>

export type HasJoinedParams = FunctionArguments<typeof functions.hasJoined>
export type HasJoinedReturn = FunctionReturn<typeof functions.hasJoined>

export type InitializeParams = FunctionArguments<typeof functions.initialize>
export type InitializeReturn = FunctionReturn<typeof functions.initialize>

export type IsWithinActiveTimeParams = FunctionArguments<typeof functions.isWithinActiveTime>
export type IsWithinActiveTimeReturn = FunctionReturn<typeof functions.isWithinActiveTime>

export type JoinGameParams = FunctionArguments<typeof functions.joinGame>
export type JoinGameReturn = FunctionReturn<typeof functions.joinGame>

export type KeyHashParams = FunctionArguments<typeof functions.keyHash>
export type KeyHashReturn = FunctionReturn<typeof functions.keyHash>

export type OwnerParams = FunctionArguments<typeof functions.owner>
export type OwnerReturn = FunctionReturn<typeof functions.owner>

export type PauseGameParams = FunctionArguments<typeof functions.pauseGame>
export type PauseGameReturn = FunctionReturn<typeof functions.pauseGame>

export type PauseHourParams = FunctionArguments<typeof functions.pauseHour>
export type PauseHourReturn = FunctionReturn<typeof functions.pauseHour>

export type PauseMinuteParams = FunctionArguments<typeof functions.pauseMinute>
export type PauseMinuteReturn = FunctionReturn<typeof functions.pauseMinute>

export type PauseSecondParams = FunctionArguments<typeof functions.pauseSecond>
export type PauseSecondReturn = FunctionReturn<typeof functions.pauseSecond>

export type PausedParams = FunctionArguments<typeof functions.paused>
export type PausedReturn = FunctionReturn<typeof functions.paused>

export type PerformUpkeepParams = FunctionArguments<typeof functions.performUpkeep>
export type PerformUpkeepReturn = FunctionReturn<typeof functions.performUpkeep>

export type PlayerTicketsParams = FunctionArguments<typeof functions.playerTickets>
export type PlayerTicketsReturn = FunctionReturn<typeof functions.playerTickets>

export type ProxiableUUIDParams = FunctionArguments<typeof functions.proxiableUUID>
export type ProxiableUUIDReturn = FunctionReturn<typeof functions.proxiableUUID>

export type RawFulfillRandomWordsParams = FunctionArguments<typeof functions.rawFulfillRandomWords>
export type RawFulfillRandomWordsReturn = FunctionReturn<typeof functions.rawFulfillRandomWords>

export type RequestIdToGameIdParams = FunctionArguments<typeof functions.requestIdToGameId>
export type RequestIdToGameIdReturn = FunctionReturn<typeof functions.requestIdToGameId>

export type RequestRandomWordsFromContractParams = FunctionArguments<typeof functions.requestRandomWordsFromContract>
export type RequestRandomWordsFromContractReturn = FunctionReturn<typeof functions.requestRandomWordsFromContract>

export type ResumeGameParams = FunctionArguments<typeof functions.resumeGame>
export type ResumeGameReturn = FunctionReturn<typeof functions.resumeGame>

export type ResumeHourParams = FunctionArguments<typeof functions.resumeHour>
export type ResumeHourReturn = FunctionReturn<typeof functions.resumeHour>

export type ResumeMinuteParams = FunctionArguments<typeof functions.resumeMinute>
export type ResumeMinuteReturn = FunctionReturn<typeof functions.resumeMinute>

export type ResumeSecondParams = FunctionArguments<typeof functions.resumeSecond>
export type ResumeSecondReturn = FunctionReturn<typeof functions.resumeSecond>

export type S_vrfCoordinatorParams = FunctionArguments<typeof functions.s_vrfCoordinator>
export type S_vrfCoordinatorReturn = FunctionReturn<typeof functions.s_vrfCoordinator>

export type SetAllowedTokenParams = FunctionArguments<typeof functions.setAllowedToken>
export type SetAllowedTokenReturn = FunctionReturn<typeof functions.setAllowedToken>

export type SetCoordinatorParams = FunctionArguments<typeof functions.setCoordinator>
export type SetCoordinatorReturn = FunctionReturn<typeof functions.setCoordinator>

export type SetFeePercentageParams = FunctionArguments<typeof functions.setFeePercentage>
export type SetFeePercentageReturn = FunctionReturn<typeof functions.setFeePercentage>

export type SetForwarderParams = FunctionArguments<typeof functions.setForwarder>
export type SetForwarderReturn = FunctionReturn<typeof functions.setForwarder>

export type SetGameParamsParams = FunctionArguments<typeof functions.setGameParams>
export type SetGameParamsReturn = FunctionReturn<typeof functions.setGameParams>

export type SetPauseTimeParams = FunctionArguments<typeof functions.setPauseTime>
export type SetPauseTimeReturn = FunctionReturn<typeof functions.setPauseTime>

export type SetResumeTimeParams = FunctionArguments<typeof functions.setResumeTime>
export type SetResumeTimeReturn = FunctionReturn<typeof functions.setResumeTime>

export type SetVRFParametersParams = FunctionArguments<typeof functions.setVRFParameters>
export type SetVRFParametersReturn = FunctionReturn<typeof functions.setVRFParameters>

export type TicketPriceParams = FunctionArguments<typeof functions.ticketPrice>
export type TicketPriceReturn = FunctionReturn<typeof functions.ticketPrice>

export type TransferOwnershipParams = FunctionArguments<typeof functions.transferOwnership>
export type TransferOwnershipReturn = FunctionReturn<typeof functions.transferOwnership>

export type UpgradeToAndCallParams = FunctionArguments<typeof functions.upgradeToAndCall>
export type UpgradeToAndCallReturn = FunctionReturn<typeof functions.upgradeToAndCall>

export type VrfCoordinatorParams = FunctionArguments<typeof functions.vrfCoordinator>
export type VrfCoordinatorReturn = FunctionReturn<typeof functions.vrfCoordinator>

export type WithDrawFeeParams = FunctionArguments<typeof functions.withDrawFee>
export type WithDrawFeeReturn = FunctionReturn<typeof functions.withDrawFee>

