import { UnT } from "../untitled-ttrpg.js"
import { UnTChatMessage } from "../chat-message.js"
import { getTyping } from "../typing.js"
import { getSizeAttackInteractions } from "../size.js"

export async function damageChat(item, hitRollTotal) {
    const damageFormula = calculateDamageFormula(item)

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

    // determine hit zone
    const hitZoneRoll = new Roll("1d10")
    await hitZoneRoll.evaluate({async: true})

    const renderedHitZoneRoll = await hitZoneRoll.render()

    const hitZone = CONFIG.UnT.hitZones.roll[hitZoneRoll.total.toString()]

    // determine effective damage
    const appliedDamageFormula = callculateEffectiveDamage(rollTotal, item, targetActor, hitZone)
    const appliedDamageResult = eval(appliedDamageFormula)

    const [sizeAccuracyModifier, _] = getSizeAttackInteractions(item.actor, targetActor)

    const accuracyModifiers = [{modType: "Size", modValue: sizeAccuracyModifier}]

    if (targetActor.items.find((e) => e.system.key === "HardToHit")) {
        accuracyModifiers.push({modType: "HardToHit", modValue: CONFIG.UnT.perks.HardToHit.accuracyDebuff})
    }

    if (item.actor.items.find((e) => e.system.key === "Accurate")) {
        accuracyModifiers.push({modType: "Accurate", modValue: CONFIG.UnT.perks.Accurate.accuracyBuff})
    }

    const totalHits = calculateHits(hitRollTotal, accuracyModifiers)

    // render DamageChat template
    const templateData = {
        item,
        targetActor,
        typing,

        accuracyModifiers,

        appliedDamageFormula,
        appliedDamageResult,
        totalHits,

        renderedHitZoneRoll,
        hitZone
    };

    // roll extra damage rolls if necessary
    if (totalHits > 1) {
        const damageFormula = calculateDamageFormula(item)

        const extraHits = []

        let newAppliedDamageFormula = appliedDamageFormula
        let newAppliedDamageResult = appliedDamageResult

        for (let i = 0; i < totalHits - 1; i++) {
            const roll = new Roll(damageFormula)
            await roll.evaluate({async: true})
        
            const renderedRoll = await roll.render()

            const effectiveDamageFormula = callculateEffectiveDamage(roll.total, item, targetActor, hitZone)
                        
            const effectiveDamage = eval(effectiveDamageFormula)

            extraHits.push({total: effectiveDamage, renderedRoll})

            if (CONFIG.UnT.bonusAttackHaveTypeInteractions) {
                const [extraHitDamageResult, extraHitDamageFormula] = 
                    calculateTypeInteractions(effectiveDamage, item.system.types, targetActor)

                newAppliedDamageFormula += " + " + effectiveDamageFormula
                newAppliedDamageResult += extraHitDamageResult
            } else {
                newAppliedDamageFormula += " + " + effectiveDamage
                newAppliedDamageResult += effectiveDamage            
            }
        }

        templateData["extraHits"] = extraHits

        templateData["appliedDamageFormula"] = newAppliedDamageFormula
        templateData["appliedDamageResult"] = newAppliedDamageResult
    }

    const cardContent = await renderTemplate(UnT.TEMPLATES.AppliedDamageChat, templateData);

    const newHp = targetActor.system.hp.value - templateData["appliedDamageResult"]
    await targetActor.update({"system.hp.value": newHp})

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
            const multiplierContribution = typing[defendingType].interactions[attackType]

            if (multiplierContribution && multiplierContribution !== 1) {
                damageMultipliers.push(multiplierContribution)
            }
        }
    }

    // let appliedDamageFormula = damageInput.toString()
    let appliedDamageFormula = ""
    let appliedDamageResult = damageInput

    for (const multiplier of damageMultipliers) {
        appliedDamageFormula += " * " + multiplier.toString()
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
    const actualHitRollTotal = hitRollTotal + modifiers.reduce((accumulator, currentValue) => accumulator + currentValue.modValue, 0)

    if (actualHitRollTotal < CONFIG.UnT.hitsOn) {
        return 0
    }

    // calculate how many bonus damage rolls attacker gets
    return 1 + Math.floor((actualHitRollTotal - CONFIG.UnT.hitsOn) / CONFIG.UnT.bonusHitsOn)
}

function calculateDamageFormula(item) {
    let damageFormula = ""
    for (const dice in item.system.components.attacks.dice) {
        if (!item.system.components.attacks.dice[dice]) { continue; }

        if (damageFormula === "") {
            damageFormula = getExplodingDice(dice)
        } else {
            damageFormula += "+" + getExplodingDice(dice)
        }
    }

    return damageFormula
}

function callculateEffectiveDamage(damageRoll, item, targetActor, hitZone) {
    const [_, sizeDamageModifier] = getSizeAttackInteractions(item.actor, targetActor)

    const hitZoneDamageModifier = CONFIG.UnT.hitZones.zones[hitZone].damageMod

    const [appliedDamageResult, appliedDamageFormula] = 
        calculateTypeInteractions(damageRoll, item.system.types, targetActor)

    return "(" + damageRoll.toString() + " + " + sizeDamageModifier.toString() + ")" + " * "  + hitZoneDamageModifier.toString() + appliedDamageFormula
}