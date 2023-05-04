import { UnT } from "../untitled-ttrpg.js"
import { UnTChatMessage } from "../chat-message.js"
import { getTyping } from "../typing.js"
import { findItem } from "../find-item.js";

export function abilityChatListeners(html) {
    html.on('click', "[data-action]", _handleButtonClick.bind(this));
    // html.on('click', "[data-action]", function() {
    //     UnT.log(false, "button click")
    // });
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

        default:
            UnT.log(false, 'Invalid action detected', action)
            break;
    }
}

export async function abilityChat (item) {
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
    // // speaker["alias"] = actor.name;
    // speaker["alias"] = "alias";

    const chatData = {
        user:  game.user._id,
        content: cardContent,
        speaker: speaker,
        borderColor: borderColor,
        itemId: item._id
    }

    return UnTChatMessage.create(chatData)
}

export async function damageChat (item) {
    // determine Damage Roll
    let damageFormula = ""
    for (const dice in item.system.components.attacks.dice) {
        if (damageFormula === "") {
            damageFormula = getExplodingDice(dice)
        } else {
            damageFormula += "+" + getExplodingDice(dice)
        }
    }

    const roll = new Roll(damageFormula)
    await roll.evaluate({async: true})

    const renderedRoll = await roll.render().then()

    const typing = getTyping()
    const itemType = item.system.types[0]
    const borderColor = typing[itemType].color

    // render DamageChat template
    const templateData = {
        item,
        renderedRoll
    };

    const cardContent = await renderTemplate(UnT.TEMPLATES.DamageChat, templateData);

    // create ChatMessage
    const speaker = ChatMessage.getSpeaker()
    // // speaker["alias"] = actor.name;
    // speaker["alias"] = "alias";

    const chatData = {
        user:  game.user._id,
        content: cardContent,
        speaker: speaker,
        borderColor: borderColor,
        itemId: item._id
    }

    return UnTChatMessage.create(chatData)
}

function getExplodingDice(dice) {
    const [numberOfDice, diceType] = dice.split("d")

    return numberOfDice + "d" + diceType + "x" + diceType
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