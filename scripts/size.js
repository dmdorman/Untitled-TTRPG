import { UnT } from "./untitled-ttrpg.js";

export function getSizeAttackInteractions(attackingActor, defendingActor) {
    const sizeDifference = CONFIG.UnT.sizes.indexOf(attackingActor.system.size) - 
        CONFIG.UnT.sizes.indexOf(defendingActor.system.size)

    const accuracyModifier = -sizeDifference
    const damageModifier = sizeDifference

    return [accuracyModifier, damageModifier]
}