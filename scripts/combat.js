import { UnT } from "./untitled-ttrpg.js";

export class UnTCombat extends Combat {
    constructor(data, context) {
        super(data, context);
    }

    async updateFactions(factions, factionData) {
        const update = {}
        update[`flags.${UnT.ID}.factions`] = factions
        update[`flags.${UnT.ID}.factionData`] = factionData

        this.update(update)
    }

    async nextTurn() {
        UnT.log(false, this)

        UnT.log(false, this.turn)
        UnT.log(false, this.flags[UnT.ID].factions)

        if (this.turn >= (this.flags[UnT.ID].factions.length - 1)) {
            const newRound = this.round + 1
            await this.update({
                round: newRound,
                turn: 0
            })
        } else {
            const newTurn = this.turn + 1
            await this.update({
                turn: newTurn
            })
        }

        UnT.log(false, this.turn)

        // if (this.turn > this.f)        

        // return this.update({ heroRound: heroRound, turn: next });
    }
}