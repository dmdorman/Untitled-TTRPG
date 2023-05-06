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

        for (const combatant of activeCombat.combatants) {
            const relevantToken = game.scenes.get(combatant.sceneId).tokens.get(combatant.tokenId)
            const relevantActor = relevantToken._actor

            const combatantFaction = getFaction(relevantActor)

            if (!(combatantFaction in factionData)) {
                factionData[combatantFaction] = []
            }

            const combatantTurnData = data.turns.filter((e) => e.id === combatant._id)[0]

            combatantTurnData['resource'] = relevantToken.actorData.system

            factionData[combatantFaction].push(combatantTurnData)
        }

        if (game.user.isGM) {
            await activeCombat.updateFactionData(factionData)
        }

        const factions = activeCombat.flags[UnT.ID].factions

        return foundry.utils.mergeObject(data, {
            factionData,
            factions
        })
    }

    activateListeners(html) {
        super.activateListeners(html);

        // override default Foundry controls
        html.on('click', "[data-action]", this._handleButtonClick.bind(this));

        Hooks.on('updateToken', (token, data, diff, id) => {
            if (token.combatant) {
                this.render()
            }
        })

        Hooks.on('createCombat', (combat, data, id) => {
            combat.updateFactions(["players", "enemies"])
        })
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

            case ('previousTurn'): {
                activeCombat.previousTurn()

                break;
            }

            case ('startCombat'): {
                const combatOrderForm = new CombatFactionOrderForm({activeCombat})

                combatOrderForm.render(true)

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

class CombatFactionOrderForm extends FormApplication {
    static get defaultOptions() {
        const defaults = super.defaultOptions;

        const overrides = {
            height: 'auto',
            width: 200,
            id: foundry.utils.randomID(),
            template: UnT.TEMPLATES.CombatFactionOrder,
            title: "Combat.TurnOrderSelector.Title",
            userId: game.userId,
            closeOnSubmit: false, // do not close when submitted
            submitOnChange: true, // submit when any input changes
            resizable: true,
        }

        const mergedOptions = foundry.utils.mergeObject(defaults, overrides);

        return mergedOptions
    }

    getData(options) {
        const factions = this.object.activeCombat.flags[UnT.ID].factions

        return {
            factions
        }
    }

    async _updateObject(event, formData) {
        // do nothing
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.on('click', "[data-action]", this._handleButtonClick.bind(this));
    }

    async _handleButtonClick(event) {
        const clickedElement = $(event.currentTarget);
        const action = clickedElement.data().action;
        const currentIndex = clickedElement.data().index;

        const factions = this.object.activeCombat.flags[UnT.ID].factions

        switch(action) {
            case ('startCombat'): {
                this.close()

                for (const combatant of this.object.activeCombat.combatants) {
                    const relevantToken = game.scenes.get(combatant.sceneId).tokens.get(combatant.tokenId)
                    const relevantActor = relevantToken._actor
                    
                    const maxAp = combatant.actor.system.ap.max

                    const combatantFaction = getFaction(combatant.actor)

                    const startingAp = Math.ceil(maxAp * ((factions.indexOf(combatantFaction) + 1)/ factions.length))

                    await relevantActor.update({"system.ap.value": startingAp})
                }

                await this.object.activeCombat.startCombat()

                break;
            }

            case ('order-increase'): {
                const relevantFaction = factions.splice(currentIndex, 1)[0]//factions[currentIndex]

                factions.splice(currentIndex - 1, 0, relevantFaction)

                const update = {}
                update[`flags.${UnT.ID}.factions`] = factions

                await this.object.activeCombat.update(update)

                this.render()

                break;
            }

            case ('order-decrease'): {
                const relevantFaction = factions.splice(currentIndex, 1)[0]//factions[currentIndex]

                factions.splice(currentIndex + 1, 0, relevantFaction)

                const update = {}
                update[`flags.${UnT.ID}.factions`] = factions

                await this.object.activeCombat.update(update)

                this.render()

                break;
            }

            default:
                UnT.log(false, 'Invalid action detected', action)
                break;
        }
    }
}
