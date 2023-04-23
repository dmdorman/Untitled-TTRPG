// game rules
import { Rules } from "./config.js";

// actor sheets
import { GroupActorSheet } from "./actor-sheets/group-sheet.js";
import { PCActorSheet } from "./actor-sheets/pc-sheet.js";

// item sheets
import { UnTItemSheet } from "./item-sheets/item-sheet.js";

// handlebars helpers
import { initializeHandlebarsHelpers } from "./handlebars-helpers.js"

Hooks.on("init", function() {
    UnT.initialize()
});

export class UnT {
    static initialize() {
        CONFIG.UnT = Rules;

        loadTemplates([
            `systems/${this.ID}/templates/partials/ItemCard.hbs`,
            `systems/${this.ID}/templates/partials/TypeRow.hbs`
        ]);

        Actors.registerSheet(`${this.ID}`, GroupActorSheet, { types: ["group"], makeDefault: true })
        Actors.registerSheet(`${this.ID}`, PCActorSheet, { types: ["pc"], makeDefault: true })

        // // Register sheet application classes
        // Actors.unregisterSheet("core", ActorSheet);
        // Actors.registerSheet("herosystem6e", HeroSystem6eActorSheet, { makeDefault: true });
        // Items.unregisterSheet("core", ItemSheet);
        // Items.registerSheet("herosystem6e", HeroSystem6eItemSheet, { makeDefault: true });

        Items.registerSheet(`${this.ID}`, UnTItemSheet, { makeDefault: true })

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
        TypeEditor: `systems/${this.ID}/templates/TypeEditor.hbs`
    }

    static log(force, ...args) {
        const shouldLog = force || game.modules.get('_dev-mode')?.active;

        if (shouldLog) {
            console.log(this.ID, '|', ...args);
        }
    }
}
