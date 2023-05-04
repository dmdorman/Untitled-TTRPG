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
            const itemId = clickedElement.closest("[data-item-id]").data().itemId
            const relevantItem = findItem(itemId)

            await damageChat(relevantItem)

            break;
        }

        case ('apply-damage'): {
            const itemId = clickedElement.closest("[data-item-id]").data().itemId
            const relevantItem = findItem(itemId)

            const rollTotal = clickedElement.closest("[data-roll-total]").data().rollTotal
            
            const targets = getTargets()

            for (const token of targets) {
                UnT.log(false, token.actor)
                await appliedDamageChat(relevantItem, token.actor, rollTotal)
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

    if (hasAttack) {
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

    return UnTChatMessage.create(chatData)
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