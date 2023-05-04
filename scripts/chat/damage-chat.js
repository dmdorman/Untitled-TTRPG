import { UnT } from "../untitled-ttrpg.js"
import { UnTChatMessage } from "../chat-message.js"
import { getTyping } from "../typing.js"

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

    // const buttonVisible = game.user.isGM

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