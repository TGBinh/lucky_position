import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, OneToMany as OneToMany_, StringColumn as StringColumn_, Index as Index_, BigIntColumn as BigIntColumn_} from "@subsquid/typeorm-store"
import {RefundClaimGame} from "./refundClaimGame.model"

@Entity_()
export class RefundClaim {
    constructor(props?: Partial<RefundClaim>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @OneToMany_(() => RefundClaimGame, e => e.refundClaim)
    refundClaimGames!: RefundClaimGame[]

    @Index_()
    @StringColumn_({nullable: false})
    playerAddress!: string

    @BigIntColumn_({nullable: false})
    amount!: bigint

    @BigIntColumn_({nullable: false})
    claimedAt!: bigint
}
