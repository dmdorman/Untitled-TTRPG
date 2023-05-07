import { UnT } from "./untitled-ttrpg.js";

export class UnTCombat extends Combat {
    constructor(data, context) {
        super(data, context);
    }

    async updateFactions(factions) {
        const update = {}
        update[`flags.${UnT.ID}.factions`] = factions

        this.update(update)
    }

    async updateFactionData(factionData) {
        const update = {}
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

export function inCombat(actorId) {
    if (!game.combats.active) { return false; }

    const relevantCombatant = game.combats.active.combatants.find((e) => e.actor._id === actorId)

    if (!relevantCombatant) { return false; }

    return true
}