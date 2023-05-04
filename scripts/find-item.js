import { UnT } from "./untitled-ttrpg.js";

export function findItem(itemId) {
    const gameItem = game.items.get(itemId)

    if (gameItem) { return gameItem; }

    const actorItem = game.actors.find(actor => actor.items.get(itemId)).items.get(itemId)

    if (actorItem) { return actorItem; }

    const tokenItem = game.scenes.tokens.find(toekn => toekn.items.get(itemId)).items.get(itemId)

    if (tokenItem) { return tokenItem; }

    UnT.log(false, 'Cannot find item [' + itemId + ']')
}