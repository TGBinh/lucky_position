import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_, StringColumn as StringColumn_, BigIntColumn as BigIntColumn_} from "@subsquid/typeorm-store"
import {Game} from "./game.model"

@Entity_()
export class Player {
    constructor(props?: Partial<Player>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @ManyToOne_(() => Game, {nullable: true})
    game!: Game | undefined | null

    @Index_()
    @StringColumn_({nullable: false})
    playerId!: string

    @Index_()
    @StringColumn_({nullable: false})
    playerAddress!: string

    @BigIntColumn_({nullable: false})
    joinedAt!: bigint
}
