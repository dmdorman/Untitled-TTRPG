import { UnT } from "../untitled-ttrpg.js"
import { UnTChatMessage } from "../chat-message.js"
import { getTyping } from "../typing.js"
import { getSizeAttackInteractions } from "../size.js"

export async function damageChat(item, hitRollTotal) {
    const damageFormula = calculateDamageFormula(item)

    UnT.log(false, damageFormula)

    const roll = new Roll(damageFormula)
    await roll.evaluate({async: true})

    const renderedRoll = await roll.render()

    const typing = getTyping()
    const itemType = item.system.types[0]
    const borderColor = typing[itemType].color

    // const buttonVisible = game.user.isGM

    const rollTotal = roll.total

    // render DamageChat template
    const templateData = {
        item,
        renderedRoll,
        rollTotal,
        hitRollTotal
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

export async function appliedDamageChat(item, targetActor, hitRollTotal, rollTotal) {
    const typing = getTyping()
    const itemType = item.system.types[0]
    const borderColor = typing[itemType].color

    const [appliedDamageResult, appliedDamageFormula] = 
        calculateTypeInteractions(rollTotal, item.system.types, targetActor)

    const [sizeAccuracyModifier, sizeDamageModifier] = getSizeAttackInteractions(item.actor, targetActor)

    const totalHits = calculateHits(hitRollTotal, [sizeAccuracyModifier])

    // render DamageChat template
    const templateData = {
        item,
        targetActor,
        typing,
        appliedDamageFormula,
        appliedDamageResult,
        totalHits
    };

    if (totalHits > 1) {
        const damageFormula = calculateDamageFormula(item)

        const extraHits = []

        let newAppliedDamageFormula = appliedDamageFormula
        let newAppliedDamageResult = appliedDamageResult

        for (let i = 0; i < totalHits - 1; i++) {
            const roll = new Roll(damageFormula)
            await roll.evaluate({async: true})
        
            const renderedRoll = await roll.render()

            extraHits.push({total: roll.total, renderedRoll})

            if (CONFIG.UnT.bonusAttackHaveTypeInteractions) {
                const [extraHitDamageResult, extraHitDamageFormula] = 
                    calculateTypeInteractions(roll.total, item.system.types, targetActor)

                newAppliedDamageFormula += " + " + extraHitDamageFormula
                newAppliedDamageResult += extraHitDamageResult
            } else {
                newAppliedDamageFormula += " + " + roll.total
                newAppliedDamageResult += roll.total            }
        }

        templateData["extraHits"] = extraHits

        templateData["appliedDamageFormula"] = newAppliedDamageFormula
        templateData["appliedDamageResult"] = newAppliedDamageResult
    }

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

function calculateHits(hitRollTotal, modifiers) {
    const actualHitRollTotal = hitRollTotal + modifiers.reduce((accumulator, currentValue) => accumulator + currentValue, 0)

    if (actualHitRollTotal < CONFIG.UnT.hitsOn) {
        return 0
    }

    // calculate how many bonus damage rolls attacker gets
    return 1 + Math.floor((actualHitRollTotal - CONFIG.UnT.hitsOn) / CONFIG.UnT.bonusHitsOn)
}

function calculateDamageFormula(item) {
    let damageFormula = ""
    for (const dice in item.system.components.attacks.dice) {
        if (damageFormula === "") {
            damageFormula = getExplodingDice(dice)
        } else {
            damageFormula += "+" + getExplodingDice(dice)
        }
    }

    return damageFormula
}