import { UnT } from "./untitled-ttrpg.js";

export function findItem(itemId) {
    const gameItem = game.items.get(itemId)

    if (gameItem) { return gameItem; }

    const actor = game.actors.find(actor => actor.items.get(itemId))

    if (actor) { return actor.items.get(itemId); }

    const token = game.scenes.active.tokens.find(token => token.actor.items.get(itemId))

    if (token) { return token.actor.items.get(itemId); }

    UnT.log(false, 'Cannot find item [' + itemId + ']')
}