import { UnT } from "./untitled-ttrpg.js";

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

        const activeCombat = data.combats.filter((e) => e.active === true)[0]

        const factionData = {}

        const factions = []

        for (const combatant of activeCombat.combatants) {
            const combatantActor = game.actors.get(combatant.actorId)

            const combatantFaction = getFaction(combatantActor)

            if (! factions.includes(combatantFaction)) {
                factions.push(combatantFaction)
            }

            if (!(combatantFaction in factionData)) {
                factionData[combatantFaction] = []
            }

            factionData[combatantFaction].push(combatant)
        }

        UnT.log(false, factionData)

        return {
            data,
            factionData,
            factions
        }
    }

    activateListeners(html) {
        super.activateListeners(html);
        // html.find('.segment-active').click(ev => this._onSegmentToggleContent(ev));

        // html.on('click', "[data-control]", this._handleButtonClick.bind(this));
    }
}

function getFaction(actor) {
    if (actor.hasPlayerOwner) {
        return "players"
    }

    return "enemies"
}