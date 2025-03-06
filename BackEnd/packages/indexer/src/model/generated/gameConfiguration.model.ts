import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, IntColumn as IntColumn_, BigIntColumn as BigIntColumn_, StringColumn as StringColumn_} from "@subsquid/typeorm-store"

@Entity_()
export class GameConfiguration {
    constructor(props?: Partial<GameConfiguration>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @IntColumn_({nullable: false})
    feePercentage!: number

    @BigIntColumn_({nullable: false})
    ticketPrice!: bigint

    @IntColumn_({nullable: false})
    duration!: number

    @BigIntColumn_({nullable: false})
    subscriptionId!: bigint

    @StringColumn_({nullable: false})
    vrfCoordinator!: string

    @StringColumn_({nullable: false})
    keyHash!: string

    @StringColumn_({nullable: false})
    forwarder!: string

    @BigIntColumn_({nullable: false})
    pauseTimestamp!: bigint

    @BigIntColumn_({nullable: false})
    resumeTimestamp!: bigint
}
