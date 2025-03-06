import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_} from "@subsquid/typeorm-store"
import {RefundClaim} from "./refundClaim.model"
import {Game} from "./game.model"

@Entity_()
export class RefundClaimGame {
    constructor(props?: Partial<RefundClaimGame>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @ManyToOne_(() => RefundClaim, {nullable: true})
    refundClaim!: RefundClaim

    @Index_()
    @ManyToOne_(() => Game, {nullable: true})
    game!: Game
}
