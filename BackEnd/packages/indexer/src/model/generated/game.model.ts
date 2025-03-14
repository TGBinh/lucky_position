import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, BigIntColumn as BigIntColumn_, Index as Index_, StringColumn as StringColumn_, OneToMany as OneToMany_} from "@subsquid/typeorm-store"
import {GameStatus} from "./_gameStatus"
import {Player} from "./player.model"
import {RefundClaimGame} from "./refundClaimGame.model"

@Entity_()
export class Game {
    constructor(props?: Partial<Game>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @BigIntColumn_({nullable: false})
    ticketPrice!: bigint

    @Index_()
    @BigIntColumn_({nullable: false})
    totalPool!: bigint

    @Index_()
    @StringColumn_({nullable: true})
    winner!: string | undefined | null

    @Index_()
    @Column_("varchar", {length: 15, nullable: false})
    status!: GameStatus

    @BigIntColumn_({nullable: false})
    startTime!: bigint

    @BigIntColumn_({nullable: false})
    endTime!: bigint

    @OneToMany_(() => Player, e => e.game)
    players!: Player[]

    @OneToMany_(() => RefundClaimGame, e => e.game)
    refundClaimGames!: RefundClaimGame[]
}
