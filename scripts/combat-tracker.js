import { UnT } from "./untitled-ttrpg.js";
import { UnTCombat } from "./combat.js"
export class UnTCombatTracker extends CombatTracker {
    static get defaultOptions() {
        const defaults = super.defaultOptions;

        const overrides = {
            template: UnT.TEMPLATES.CombatTracker
        }

        const mergedOptions = foundry.utils.mergeObject(defaults, overrides);

        return mergedOptions
    }

    async getData(options) {
        const data = await super.getData(options)

        const activeCombat = game.combats.active

        if (activeCombat === undefined) { return data }

        const factionData = {}

        const factions = []

        for (const combatant of activeCombat.combatants) {
            const relevantToken = game.scenes.get(combatant.sceneId).tokens.get(combatant.tokenId)
            const relevantActor = relevantToken._actor

            const combatantFaction = getFaction(relevantActor)

            if (! factions.includes(combatantFaction)) {
                factions.push(combatantFaction)
            }

            if (!(combatantFaction in factionData)) {
                factionData[combatantFaction] = []
            }

            const combatantTurnData = data.turns.filter((e) => e.id === combatant._id)[0]

            combatantTurnData['resource'] = relevantToken.actorData.system

            factionData[combatantFaction].push(combatantTurnData)
        }

        await activeCombat.updateFactions(factions, factionData)

        return foundry.utils.mergeObject(data, {
            factionData,
            factions
        })
    }

    activateListeners(html) {
        super.activateListeners(html);

        // override default Foundry controls
        html.on('click', "[data-action]", this._handleButtonClick.bind(this));
    }

    async _handleButtonClick(event) {
        const clickedElement = $(event.currentTarget);
        const action = clickedElement.data().action;

        const activeCombat = game.combats.active

        switch(action) {
            case ('nextTurn'): {
                activeCombat.nextTurn()

                break;
            }

            default:
                UnT.log(false, 'Invalid action detected', action)
                break;
        }
    }
}

function getFaction(actor) {
    if (actor.hasPlayerOwner) {
        return "players"
    }

    return "enemies"
}
