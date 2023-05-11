import { UnT } from "../untitled-ttrpg.js"
import { UnTChatMessage } from "../chat-message.js"
import { getTyping } from "../typing.js"
import { findItem } from "../find-item.js";
import { appliedDamageChat, damageChat } from "./damage-chat.js";

export function abilityChatListeners(html) {
    html.on('click', "[data-action]", _handleButtonClick.bind(this));
}

async function _handleButtonClick(event) {
    const clickedElement = $(event.currentTarget);
    const action = clickedElement.data().action;

    switch(action) {
        case ('roll-damage'): {
            const messageId = clickedElement.closest("[data-message-id]").data().messageId

            const itemId = clickedElement.closest("[data-item-id]").data().itemId
            const relevantItem = findItem(itemId)

            const hitRollTotal = clickedElement.closest("[data-hit-total]").data().hitTotal

            await damageChat(messageId, relevantItem, hitRollTotal)

            break;
        }

        case ('apply-damage'): {
            const rootMessageId = clickedElement.closest("[data-root-id]").data().rootId

            const itemId = clickedElement.closest("[data-item-id]").data().itemId
            const relevantItem = findItem(itemId)

            const rollTotal = clickedElement.closest("[data-roll-total]").data().rollTotal
            
            const hitRollTotal = clickedElement.closest("[data-hit-total]").data().hitTotal

            const targets = getTargets()

            if (targets.length === 0) {
                ui.notifications.warn("Notifications.SelectToken", { localize: true });
            }

            for (const token of targets) {
                await appliedDamageChat(rootMessageId, relevantItem, token.actor, hitRollTotal, rollTotal)
            }

            break;
        }

        default:
            UnT.log(false, 'Invalid action detected', action)
            break;
    }
}

export async function abilityChat(item) {
    // determine Attack Roll
    const formula = [ CONFIG.UnT.dice.attackDie.dice + "x" + CONFIG.UnT.dice.attackDie.explodesOn ]

    const roll = new Roll(formula.join())
    await roll.evaluate({async: true})

    const renderedRoll = await roll.render()

    const typing = getTyping()
    const itemType = item.system.types[0]
    const borderColor = typing[itemType].color

    const hasAttack = hasComponentType(item, 'attacks')

    const buttonVisible = (item.isOwner || game.user.isGM)? true : false

    // render AbilityChat template
    const templateData = {
        item,
        hasAttack,
        buttonVisible
    };

    let accuracyModifiers;
    if (hasAttack) {
        accuracyModifiers = await accuracyForm()

        templateData['hitRollTotal'] = roll.total
        templateData['renderedRoll'] = renderedRoll
    }

    const cardContent = await renderTemplate(UnT.TEMPLATES.AbilityChat, templateData);

    // create ChatMessage
    const speaker = ChatMessage.getSpeaker()
    speaker["alias"] = item.actor.name;

    const chatData = {
        user:  game.user._id,
        content: cardContent,
        speaker: speaker,
        borderColor: borderColor,
        itemId: item._id
    }

    const message = await UnTChatMessage.create(chatData)

    if (hasAttack) {
        const update = {}
        update[`flags.${UnT.ID}.accuracyModifiers`] = accuracyModifiers
        message.update(update)
    }
}

export function getTargets() {
    return canvas.tokens.controlled.filter(token => !!token.actor);;
}


function hasComponentType(item, type) {
    const typeComponents = item.system.components[type]

    if (typeComponents === undefined) {
        return false
    }

    for (const component in typeComponents) {
        for (const componentValue in typeComponents[component]) {
            if (typeComponents[component][componentValue]) { return true; }
        }
    }

    return false
}

async function accuracyForm() {
	const templateData = {
		CONFIG
	};

	const content = await renderTemplate(UnT.TEMPLATES.AccuracyForm, templateData);

	const promise = new Promise(resolve => {
		const data = {
			title: game.i18n.localize("Attack.AccuracyModifiers"),
			content: content,
			buttons: {
				rollToHit: {
					label: game.i18n.localize("General.Roll"),
					callback: html => {
                        const formData = new FormData(html[0].querySelector("form"));

                        const data = {};
                        for (const [name, value] of formData.entries()) {
                            data[name] = value;
                        }

                        resolve(data);
                    }
				},
			},
			default: "rollToHit",
			close: () => resolve({})
		}

		new Dialog(data, { 'width': 300 }).render(true);;
	});

    return promise.then(formData => {
        return formData
    });
}