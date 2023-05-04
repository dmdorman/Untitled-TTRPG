import { UnT } from "../untitled-ttrpg.js"
import { UnTChatMessage } from "../chat-message.js"
import { getTyping } from "../typing.js"

export async function damageChat(item) {
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

    const rollTotal = roll.total

    // render DamageChat template
    const templateData = {
        item,
        renderedRoll,
        rollTotal
    };

    const cardContent = await renderTemplate(UnT.TEMPLATES.DamageChat, templateData);

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

export async function appliedDamageChat(item, targetActor, rollTotal) {
    const typing = getTyping()
    const itemType = item.system.types[0]
    const borderColor = typing[itemType].color

    const [appliedDamageResult, appliedDamageFormula] = 
        calculateTypeInteractions(rollTotal, item.system.types, targetActor)

    // render DamageChat template
    const templateData = {
        item,
        targetActor,
        typing,
        appliedDamageFormula,
        appliedDamageResult
    };

    const cardContent = await renderTemplate(UnT.TEMPLATES.AppliedDamageChat, templateData);

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

export function calculateTypeInteractions(damageInput, attackTypes, defendingActor) {
    const typing = getTyping()

    const damageMultipliers = []
    for (const attackType of attackTypes) {
        for (const defendingType of defendingActor.system.types) {
            const multiplierContribution = typing[attackType].interactions[defendingType]

            if (multiplierContribution && multiplierContribution !== 1) {
                damageMultipliers.push(multiplierContribution)
            }
        }
    }

    let appliedDamageFormula = damageInput.toString()
    let appliedDamageResult = damageInput

    for (const multiplier of damageMultipliers) {
        appliedDamageFormula += " x " + multiplier.toString()
        appliedDamageResult *= multiplier
    }

    if (defendingActor.hasPlayerOwner) {
        appliedDamageResult = Math.floor(appliedDamageResult)
    } else {
        appliedDamageResult = Math.ceil(appliedDamageResult)
    }

    return [appliedDamageResult, appliedDamageFormula]
}

function getExplodingDice(dice) {
    const [numberOfDice, diceType] = dice.split("d")

    return numberOfDice + "d" + diceType + "x" + diceType
}