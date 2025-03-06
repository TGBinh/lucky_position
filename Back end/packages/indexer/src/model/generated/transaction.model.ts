import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_, StringColumn as StringColumn_, BigIntColumn as BigIntColumn_} from "@subsquid/typeorm-store"
import {Game} from "./game.model"

@Entity_()
export class Transaction {
    constructor(props?: Partial<Transaction>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @ManyToOne_(() => Game, {nullable: true})
    game!: Game | undefined | null

    @Index_()
    @StringColumn_({nullable: false})
    playerAddress!: string

    @BigIntColumn_({nullable: false})
    amount!: bigint

    @Index_()
    @StringColumn_({nullable: false})
    txHash!: string

    @BigIntColumn_({nullable: false})
    timestamp!: bigint
}
