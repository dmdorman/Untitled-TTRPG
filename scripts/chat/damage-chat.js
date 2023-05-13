import { UnT } from "../untitled-ttrpg.js"
import { UnTChatMessage } from "../chat-message.js"
import { getTyping } from "../typing.js"
import { getSizeAttackInteractions } from "../size.js"
import { hasPerk } from "../perks.js"

export async function damageChat(rootMessageId, item, hitRollTotal) {
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
        hitRollTotal,
        rootMessageId
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
        itemId: item._id,
        sound: CONFIG.sounds.dice
    }

    return UnTChatMessage.create(chatData)
}

export async function appliedDamageChat(rootMessageId, item, targetActor, hitRollTotal, rollTotal) {
    const rootMessage = game.messages.get(rootMessageId)
    
    const typing = getTyping()
    const itemType = item.system.types[0]
    const borderColor = typing[itemType].color

    const accuracyModifiers = [];

    // determine hit zone
    let renderedHitZoneRoll, hitZone;
    if (rootMessage.flags[UnT.ID].accuracyModifiers.aim === "None") {
        [renderedHitZoneRoll, hitZone] = await getHitzone(targetActor)
    } else {
        hitZone = rootMessage.flags[UnT.ID].accuracyModifiers.aim

        accuracyModifiers.push({modType: game.i18n.localize("Attack.Aim"), modValue: CONFIG.UnT.hitZones.zones[hitZone].aimPenalty, type: 'add'})

        renderedHitZoneRoll = ""; // don't render a hit zone roll
    }

    const otherAccuracyMod = parseInt(rootMessage.flags[UnT.ID].accuracyModifiers.accuracyMod)

    if (otherAccuracyMod !== 0) {
        accuracyModifiers.push({modType: game.i18n.localize("General.Other"), modValue: otherAccuracyMod, type: 'add'})
    }

    // determine effective damage
    const [damageModifiers, appliedDamageFormula] = calculateEffectiveDamage(rollTotal, item, targetActor, hitZone, false)

    const appliedDamageResult = roundDamage(targetActor, eval(appliedDamageFormula))

    const [sizeAccuracyModifier, _] = getSizeAttackInteractions(item.actor, targetActor)

    accuracyModifiers.push({modType: game.i18n.localize("Sizes.Size"), modValue: sizeAccuracyModifier, type: 'add'})

    if (hasPerk(targetActor, "HardToHit")) {
        accuracyModifiers.push({modType: game.i18n.localize("Perks.HardToHit"), modValue: CONFIG.UnT.perks.HardToHit.accuracyDebuff, type: 'add'})
    }

    if (hasPerk(targetActor, "Accurate")) {
        accuracyModifiers.push({modType: game.i18n.localize("Perks.Accurate"), modValue: CONFIG.UnT.perks.Accurate.accuracyBuff, type: 'add'})
    }

    const [totalHits, actualHitRollTotal] = calculateHits(hitRollTotal, accuracyModifiers)

    // render DamageChat template
    const templateData = {
        item,
        targetActor,
        typing,

        accuracyModifiers,
        damageModifiers,

        actualHitRollTotal,

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

            const [extraHitsModifiers, effectiveDamageFormula] = calculateEffectiveDamage(roll.total, item, targetActor, hitZone, true)
                        
            const effectiveDamage = roundDamage(targetActor, eval(effectiveDamageFormula))

            extraHits.push({total: effectiveDamage, renderedRoll, damageModifiers: extraHitsModifiers})

            newAppliedDamageFormula += " + " + effectiveDamage
            newAppliedDamageResult += effectiveDamage            
        }

        templateData["extraHits"] = extraHits

        templateData["appliedDamageFormula"] = newAppliedDamageFormula

        if (targetActor.hasPlayerOwner) {
            templateData["appliedDamageResult"] = Math.floor(newAppliedDamageResult)
        } else {
            templateData["appliedDamageResult"] = Math.ceil(newAppliedDamageResult)
        }
    }

    if (templateData["appliedDamageResult"] < 0) {
        templateData["appliedDamageResult"] = 0
    }

    // determine attack effects
    const effects = []

    if (totalHits > 0) {
        const oblation = await calculateDefenseOblation(targetActor, templateData["appliedDamageResult"], hitZone)
        effects.push(oblation)
    }

    templateData["effects"] = effects

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
        itemId: item._id,
        sound: CONFIG.sounds.dice
    }

    return UnTChatMessage.create(chatData)
}

export function calculateTypeInteractions(damageInput, attackTypes, defendingActor) {
    const typing = getTyping()

    const damageMultipliers = []
    for (const attackType of attackTypes) {
        for (const defendingType of defendingActor.system.types) {
            const multiplierContribution = typing[defendingType].interactions[attackType]


            damageMultipliers.push({modType: typing[attackType].name + " x " + typing[defendingType].name, 
                modValue: multiplierContribution, type: 'mult'})
        }
    }

    return damageMultipliers
}

function getExplodingDice(dice) {
    const [numberOfDice, diceType] = dice.split("d")

    return numberOfDice + "d" + diceType + "x" + diceType
}

function calculateHits(hitRollTotal, modifiers) {
    const actualHitRollTotal = hitRollTotal + modifiers.reduce((accumulator, currentValue) => accumulator + currentValue.modValue, 0)

    if (actualHitRollTotal < CONFIG.UnT.hitsOn) {
        return [0, actualHitRollTotal]
    }

    // calculate how many bonus damage rolls attacker gets
    const totalHits = 1 + Math.floor((actualHitRollTotal - CONFIG.UnT.hitsOn) / CONFIG.UnT.bonusHitsOn)

    return [totalHits, actualHitRollTotal]
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

function calculateEffectiveDamage(damageRoll, item, targetActor, hitZone, isExtraHit) {
    const damageModifiers = []

    if (hasPerk(targetActor, "NoWeakPoints")) {
        damageModifiers.push({modType: game.i18n.localize("Perks.NoWeakPoints")})
    }

    if (hasPerk(targetActor, "Amorphous")) {
        damageModifiers.push({modType: game.i18n.localize("Perks.Amorphous")})
    }

    const [_, sizeDamageModifier] = getSizeAttackInteractions(item.actor, targetActor)

    damageModifiers.push({modType: game.i18n.localize("Sizes.Size"), modValue: sizeDamageModifier, type: 'add'})

    const hitZoneDamageModifier = getHitZoneDamageModifier(targetActor, hitZone)
    damageModifiers.push({modType: game.i18n.localize("HitZone.HitZone"), modValue: hitZoneDamageModifier.toString(), type: 'mult'})

    if (!isExtraHit || CONFIG.UnT.bonusAttackHaveTypeInteractions) {
        const typeInteractions = calculateTypeInteractions(damageRoll, item.system.types, targetActor)
        damageModifiers.push(...typeInteractions)
    }

    const defense = targetActor.flags.UnT[hitZone].value || 0
    const tempDefense = targetActor.flags.UnT[hitZone].temp || 0
    const totalDefense = defense + tempDefense
    damageModifiers.push({modType: game.i18n.localize("General.Defense"), modValue: -totalDefense, type: 'add'})

    // construct formula
    let damageFormula = damageRoll.toString()

    const adders = damageModifiers.filter((e) => e.type === "add"  && e.modValue !== 0)

    for (const adder of adders) {
        if (adder.modValue < 0) {
            damageFormula += adder.modValue.toString() 
        } else {
            damageFormula += " + " + adder.modValue.toString() 
        }
    }

    if (adders.length !== 0) {
        damageFormula = "(" + damageFormula + ")"
    }
    
    const multipliers = damageModifiers.filter((e) => e.type === "mult"  && e.modValue !== 1)

    for (const multiplier of multipliers) {
        damageFormula += " * " + multiplier.modValue.toString()
    }

    return [damageModifiers, damageFormula]
}

async function getHitzone(targetActor) {
    const hitZoneRoll = new Roll("1d10")
    await hitZoneRoll.evaluate({async: true})

    const renderedHitZoneRoll = await hitZoneRoll.render()

    const hitZone = CONFIG.UnT.hitZones.roll[hitZoneRoll.total.toString()]

    return [renderedHitZoneRoll, hitZone]
}

function getHitZoneDamageModifier(targetActor, hitZone) {
    if (hasPerk(targetActor, "NoWeakPoints")) {
        return CONFIG.UnT.perks.NoWeakPoints.zones[hitZone].damageMod
    }

    if (hasPerk(targetActor, "Amorphous")) {
        return CONFIG.UnT.perks.Amorphous.zones[hitZone].damageMod
    }

    return CONFIG.UnT.hitZones.zones[hitZone].damageMod
}

function roundDamage(target, damage) {
    if (target.hasPlayerOwner) {
        return Math.floor(damage)
    }

    return Math.ceil(damage)
}

async function calculateDefenseOblation(targetActor, damage, hitZone) {
    const oblationTotal = Math.floor(damage / CONFIG.UnT.defenseOblatesOn)

    let appliedOblation = oblationTotal
    let tempArmor = targetActor.flags.UnT[hitZone].temp || 0
    let armor = targetActor.flags.UnT[hitZone].value || 0

    if (tempArmor > 0) {
        tempArmor -= appliedOblation
    }

    if (tempArmor < 0) {
        armor += appliedOblation

        tempArmor = 0
    }

    if (armor < 0) {
        armor = 0
    }

    const update = []
    update[`flags.UnT.${hitZone}.temp`] = tempArmor
    update[`flags.UnT.${hitZone}.value`] = armor

    await targetActor.update(update)

    return {modType: game.i18n.localize("General.ArmorOblation"), modValue: -oblationTotal, type: 'add'}
}