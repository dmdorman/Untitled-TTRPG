import { UnT } from "../untitled-ttrpg.js"

export class PCActorSheet extends ActorSheet {
    static get defaultOptions() {
        const defaults = super.defaultOptions;

        const overrides = {
            height: 600,
            width: 500,
            id: foundry.utils.randomID(),
            template: UnT.TEMPLATES.PCActorSheet,
            title: "Group.Sheet.Title",
            userId: game.userId,
            closeOnSubmit: false, // do not close when submitted
            submitOnChange: true, // submit when any input changes
            resizable: false,
        }

        const mergedOptions = foundry.utils.mergeObject(defaults, overrides);

        return mergedOptions
    }

    async getData() {
        const data = super.getData()

        // const actors = GroupActorData.getActorsByIds(this.actor.system.linkedIds)

        return {
            data,
            ID: UnT.ID
            // actors
        };
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.on('click', "[data-action]", this._handleButtonClick.bind(this));
    }

    async _handleButtonClick(event) {
        const clickedElement = $(event.currentTarget);
        const action = clickedElement.data().action;

        switch(action) {
            default:
                UnT.log(false, 'Invalid action detected', action)
                break;
        }
    }
}