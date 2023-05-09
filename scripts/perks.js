export function hasPerk(actor, perkId) {
    return actor.items.find((e) => e.system.key === perkId)
}