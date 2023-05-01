import { UnT } from "../untitled-ttrpg.js"
import { UnTChatMessage } from "../chat-message.js"
import { getTyping } from "../typing.js"

export async function attackRoll (item) {
    // determine Attack Roll
    const formula = [ CONFIG.UnT.dice.attackDie.dice + "x" + CONFIG.UnT.dice.attackDie.explodesOn ]

    const roll = new Roll(formula.join())
    roll.evaluate({async: true})

    const renderedRoll = await roll.render()

    // render AttackRoll template
    const templateData = {
        renderedRoll
    };
    const cardContent = await renderTemplate(UnT.TEMPLATES.AttackRoll, templateData);

    // create ChatMessage
    const speaker = ChatMessage.getSpeaker()
    // // speaker["alias"] = actor.name;
    // speaker["alias"] = "alias";

    const typing = getTyping()
    const itemType = item.system.types[0]
    const borderColor = typing[itemType].color

    const chatData = {
        user:  game.user._id,
        content: cardContent,
        speaker: speaker,
        borderColor: borderColor
    }

    return UnTChatMessage.create(chatData)
}