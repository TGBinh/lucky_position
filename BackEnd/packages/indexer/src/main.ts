import { EvmBatchProcessor } from '@subsquid/evm-processor'
import { TypeormDatabase } from '@subsquid/typeorm-store'
import * as luckypositionAbi from './abi/lucky-position'
import {
  Game,
  Player,
  GameStatus,
  Transaction,
  RefundClaim,
  RefundClaimGame,
  GameConfiguration
} from './model'

class IdGenerator {
  private ids: Record<string, number>

  constructor() {
    this.ids = {}
  }

  public getNextId(key: string): number {
    if (this.ids[key] === undefined) {
      this.ids[key] = 0;
    }
    return this.ids[key]++
  }  
}
const idGenerator = new IdGenerator()

const processor = new EvmBatchProcessor()
  .setGateway('https://v2.archive.subsquid.io/network/ethereum-sepolia')
  .setRpcEndpoint({
    url: process.env.RPC_SEPOLIA_HTTP as string,
    rateLimit: 5
  })
  .setFinalityConfirmation(12)
  .addLog({
    address: ['0x087a9DFe5C97519B79d7731892E6915c32522a6D'],
    topic0: [
      luckypositionAbi.events.GameCreated.topic,
      luckypositionAbi.events.GameEnded.topic,
      luckypositionAbi.events.GameFailed.topic,
      luckypositionAbi.events.GamePaused.topic,
      luckypositionAbi.events.GameResumed.topic,
      luckypositionAbi.events.PlayerJoined.topic,
      luckypositionAbi.events.RefundClaimed.topic,
      luckypositionAbi.events.FeeUpdated.topic,
      luckypositionAbi.events.ForwarderUpdated.topic,
      luckypositionAbi.events.GameParamsUpdated.topic,
      luckypositionAbi.events.PauseTimeUpdated.topic,
      luckypositionAbi.events.ResumeTimeUpdated.topic,
      luckypositionAbi.events.VRFParametersUpdated.topic
    ]
  })

export { processor }

const db = new TypeormDatabase()

processor.run(db, async (ctx) => {
  const gameMap: Map<string, Game> = new Map()
  const players: Player[] = []
  // const transactions: Transaction[] = [] 
  const refundClaims: RefundClaim[] = []
  const refundClaimGames: RefundClaimGame[] = []

  let gameConfig = (await ctx.store.get(GameConfiguration, "singleton")) ?? null;
  if (!gameConfig) {
    gameConfig = new GameConfiguration({
      id: "singleton",
      feePercentage: 0,
      ticketPrice: BigInt(0),
      duration: 0,
      subscriptionId: BigInt(0),
      vrfCoordinator: "",
      keyHash: "",
      forwarder: "",
      pauseTimestamp: BigInt(0),
      resumeTimestamp: BigInt(0)
    });
  }


  async function getGame(gameIdStr: string): Promise<Game | null> {
    if (gameMap.has(gameIdStr)) {
      return gameMap.get(gameIdStr)!
    }
    const game = await ctx.store.get(Game, gameIdStr)
    if (game) {
      gameMap.set(gameIdStr, game)
      return game
    }
    return null
  }

  for (let block of ctx.blocks) {
    for (let log of block.logs) {
      const topic0 = log.topics[0]

      if (topic0 === luckypositionAbi.events.GameCreated.topic) {
        const { gameId, ticketPrice, startTime, endTime } =
          luckypositionAbi.events.GameCreated.decode(log)
        const gameIdStr = gameId.toString()
        let game = await getGame(gameIdStr)
        if (!game) {
          game = new Game({
            id: gameIdStr,
            ticketPrice: BigInt(ticketPrice),
            totalPool: BigInt(0),
            winner: "",
            status: GameStatus.CREATED,
            startTime: BigInt(startTime),
            endTime: BigInt(endTime),
            players: []
          })
          gameMap.set(gameIdStr, game)
        }
      }

      if (topic0 === luckypositionAbi.events.GameEnded.topic) {
        const { gameId, winner, totalReward } = luckypositionAbi.events.GameEnded.decode(log)
        const gameIdStr = gameId.toString()
        let game = await getGame(gameIdStr)
        if (game) {
          game.status = GameStatus.ENDED
          game.winner = winner.toString()
          game.totalPool = BigInt(totalReward)
        }
      }

      if (topic0 === luckypositionAbi.events.GamePaused.topic) {
        const { gameId } = luckypositionAbi.events.GamePaused.decode(log)
        const gameIdStr = gameId.toString()
        let game = await getGame(gameIdStr)
        if (game) {
          game.status = GameStatus.PAUSED
        }
      }

      if (topic0 === luckypositionAbi.events.GameResumed.topic) {
        const { gameId } = luckypositionAbi.events.GameResumed.decode(log)
        const gameIdStr = gameId.toString()
        let game = await getGame(gameIdStr)
        if (game) {
          game.status = GameStatus.CREATED
        }
      }

      if (topic0 === luckypositionAbi.events.GameFailed.topic) {
        const { gameId } = luckypositionAbi.events.GameFailed.decode(log)
        const gameIdStr = gameId.toString()
        let game = await getGame(gameIdStr)
        if (game) {
          game.status = GameStatus.FAILED
        }
      }

      if (topic0 === luckypositionAbi.events.PlayerJoined.topic) {
        const { gameId, playerId, player, joinedAt } =
          luckypositionAbi.events.PlayerJoined.decode(log)
        const gameIdStr = gameId.toString()
        let gameObj = await getGame(gameIdStr)
        if (gameObj) {
          gameObj.totalPool = gameObj.totalPool + gameObj.ticketPrice
        }
        const playerObj = new Player({
          id: idGenerator.getNextId('player').toString(),
          game: gameObj, 
          playerId: playerId.toString(),
          playerAddress: player.toString(),
          joinedAt: BigInt(joinedAt)
        })
        players.push(playerObj)

        /*
        const tx = new Transaction({
          id: idGenerator.getNextId('transaction').toString(),
          game: gameObj,
          playerAddress: player.toString(),
          amount: gameObj ? gameObj.ticketPrice : BigInt(0),
          txHash: log.transaction?.hash ?? "",
          timestamp: BigInt(log.block.timestamp)
        })
        transactions.push(tx)
        */
      }

      if (topic0 === luckypositionAbi.events.RefundClaimed.topic) {
        const { player, amount, gameIds, refundedAt } =
          luckypositionAbi.events.RefundClaimed.decode(log)
        const refundClaim = new RefundClaim({
          id: idGenerator.getNextId('refundClaim').toString(),
          playerAddress: player.toString(),
          amount: BigInt(amount),
          claimedAt: BigInt(refundedAt)
        })
        refundClaims.push(refundClaim)

        for (const gId of gameIds) {
          const gameIdStr = gId.toString()
          let gameObj = await getGame(gameIdStr)
          if (gameObj) {
            const rcg = new RefundClaimGame({
              id: idGenerator.getNextId('refundClaimGame').toString(),
              refundClaim: refundClaim,
              game: gameObj
            })
            refundClaimGames.push(rcg)
          }
        }
      }

      if (topic0 === luckypositionAbi.events.FeeUpdated.topic) {
        const { newFeePercentage } = luckypositionAbi.events.FeeUpdated.decode(log)
        gameConfig.feePercentage = Number(newFeePercentage)
      }

      if (topic0 === luckypositionAbi.events.ForwarderUpdated.topic) {
        const { newForwarder } = luckypositionAbi.events.ForwarderUpdated.decode(log)
        gameConfig.forwarder = newForwarder.toString()
      }

      if (topic0 === luckypositionAbi.events.GameParamsUpdated.topic) {
        const { ticketPrice, duration } = luckypositionAbi.events.GameParamsUpdated.decode(log)
        gameConfig.ticketPrice = BigInt(ticketPrice)
        gameConfig.duration = Number(duration)
      }

      if (topic0 === luckypositionAbi.events.PauseTimeUpdated.topic) {
        const { hour, minute, second } = luckypositionAbi.events.PauseTimeUpdated.decode(log)
        gameConfig.pauseTimestamp = BigInt(hour) * BigInt(3600) +
                                    BigInt(minute) * BigInt(60) +
                                    BigInt(second)
      }

      if (topic0 === luckypositionAbi.events.ResumeTimeUpdated.topic) {
        const { hour, minute, second } = luckypositionAbi.events.ResumeTimeUpdated.decode(log)
        gameConfig.resumeTimestamp = BigInt(hour) * BigInt(3600) +
                                     BigInt(minute) * BigInt(60) +
                                     BigInt(second)
      }

      if (topic0 === luckypositionAbi.events.VRFParametersUpdated.topic) {
        const { subscriptionId, vrfCoordinator, keyHash } = luckypositionAbi.events.VRFParametersUpdated.decode(log)
        gameConfig.subscriptionId = BigInt(subscriptionId)
        gameConfig.vrfCoordinator = vrfCoordinator.toString()
        gameConfig.keyHash = keyHash.toString()
      }
    }
  }

  await ctx.store.save([...gameMap.values()])
  await ctx.store.save(players)
  // await ctx.store.save(transactions) 
  await ctx.store.save(refundClaims)
  await ctx.store.save(refundClaimGames)
  await ctx.store.save(gameConfig)
})
