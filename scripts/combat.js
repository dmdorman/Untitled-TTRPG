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
    }

    async previousTurn() {
        if (this.turn === 0) {
            const newRound = this.round - 1
            const newTurn = this.flags[UnT.ID].factions.length - 1
            await this.update({
                round: newRound,
                turn: newTurn
            })
        } else {
            const newTurn = this.turn - 1
            await this.update({
                turn: newTurn
            })
        }
    }
}