import { UnT } from "./untitled-ttrpg.js";

export function getTotalMaxArmor(actor) {
    if (!actor.flags.UnT) { return 0;}

    const totalMaxArmor = Object.values(actor.flags.UnT).reduce((accumulator, hitZone) => {
        if (hitZone.max !== null) {
            return accumulator + hitZone.max;
        }

        return accumulator;

    }, 0);

    return totalMaxArmor
}