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

    async _updateObject(event, formData) {
        await super._updateObject(event, formData)    

        const expandedData = foundry.utils.expandObject(formData);

        const newTypeKey = 'new-type'

        if (!(expandedData[newTypeKey] === 'null') && !(this.actor.system.types.includes(expandedData[newTypeKey]))) {
            const types = this.actor.system.types;
            types.push(expandedData[newTypeKey])

            await this.actor.update({'system.types': types})
        }

        this.render();
    }

    async getData() {
        const data = super.getData()

        return {
            data,
            ID: UnT.ID,
            typing: JSON.parse(game.settings.get(UnT.ID, 'typing'))
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
            case ('set-editable'): {
                const inEditMode = this.actor.system.inEditMode;

                this.actor.update({'system.inEditMode': !inEditMode})

                break;
            }

            default:
                UnT.log(false, 'Invalid action detected', action)
                break;
        }
    }
}