// game rules
import { Rules } from "./config.js";

// actor sheets
import { GroupActorSheet } from "./actor-sheets/group-sheet.js";
import { PCActorSheet } from "./actor-sheets/pc-sheet.js";

// item sheets
import { UnTItemSheet } from "./item-sheets/item-sheet.js";

// combat tracker
import { UnTCombatTracker } from "./combat-tracker.js"

// combat
import { UnTCombat } from "./combat.js"

// handlebars helpers
import { initializeHandlebarsHelpers } from "./handlebars-helpers.js"

// chat message
import { UnTChatMessage } from "./chat-message.js";
import { abilityChatListeners } from "./chat/ability-chat.js";

Hooks.on("init", function() {
    UnT.initialize()
});


Hooks.on("renderChatMessage", (message, html, data) => {
    const buttonElements = html.find("[data-action]");
  
    const showButton = ((message._source.user === game.user.id) || (game.user.isGM))? true : false

    if (showButton) {
      buttonElements.show();
    } else {
      buttonElements.hide();
    }

    abilityChatListeners(html)
});


export class UnT {
    static initialize() {
        CONFIG.UnT = Rules;

        loadTemplates([
            `systems/${this.ID}/templates/partials/ItemCard.hbs`,
            `systems/${this.ID}/templates/partials/TypeRow.hbs`,
            `systems/${this.ID}/templates/partials/Profile.hbs`,
            `systems/${this.ID}/templates/partials/SizeSelector.hbs`,
            `systems/${this.ID}/templates/partials/HP.hbs`,
            `systems/${this.ID}/templates/partials/AP.hbs`,
            `systems/${this.ID}/templates/partials/Modifiers.hbs`
        ]);

        Actors.unregisterSheet("core", ActorSheet);

        Actors.registerSheet(`${this.ID}`, GroupActorSheet, { types: ["group"], makeDefault: true })
        Actors.registerSheet(`${this.ID}`, PCActorSheet, { types: ["pc", "npc"], makeDefault: true })

        Items.unregisterSheet("core", ItemSheet);

        Items.registerSheet(`${this.ID}`, UnTItemSheet, { makeDefault: true })

        CONFIG.ui.combat = UnTCombatTracker
        CONFIG.Combat.documentClass = UnTCombat

        CONFIG.ChatMessage.entityClass = UnTChatMessage;
        CONFIG.ChatMessage.documentClass = UnTChatMessage;

        initializeHandlebarsHelpers()

        // this needs to move to the GroupActor class once its made
        Hooks.on("deleteActor", (actor, options, userId) => {
            UnT.log(false, `Actor with ID '${actor._id}' has been deleted by user '${userId}'.`)

            const groupActors = game.actors.filter((actor) => actor.type === 'group')

            for (const actor of groupActors) {
                const linkedIds = actor.system.linkedIds

                const newLinkedIds = []
                for (const actorId of linkedIds) {
                    if (game.actors.get(actorId)) {
                        newLinkedIds.push(actorId)
                    }
                }

                actor.update({"system.linkedIds": newLinkedIds})
            }
        });
    }

    static ID = 'untitled-ttrpg';

    static SOCKET = 'system.' + this.ID

    static SETTINGS = {}

    static TEMPLATES = {
        GroupActorSheet: `systems/${this.ID}/templates/GroupActorSheet.hbs`,
        PCActorSheet: `systems/${this.ID}/templates/PCActorSheet.hbs`,
        ActorPicker: `systems/${this.ID}/templates/ActorPicker.hbs`,
        TypesForm: `systems/${this.ID}/templates/TypesForm.hbs`,
        TypeEditor: `systems/${this.ID}/templates/TypeEditor.hbs`,
        ComponentPicker: `systems/${this.ID}/templates/ComponentPicker.hbs`,
        CombatTracker: `systems/${this.ID}/templates/CombatTracker.hbs`,
        AbilityChat: `systems/${this.ID}/templates/chat/AbilityChat.hbs`,
        DamageChat: `systems/${this.ID}/templates/chat/DamageChat.hbs`,
        AppliedDamageChat: `systems/${this.ID}/templates/chat/AppliedDamageChat.hbs`,
        CombatFactionOrder: `systems/${this.ID}/templates/CombatFactionOrder.hbs`
    }

    static log(force, ...args) {
        const shouldLog = force || game.modules.get('_dev-mode')?.active;

        if (shouldLog) {
            console.log(this.ID, '|', ...args);
        }
    }
}
