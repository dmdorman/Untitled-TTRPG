import { UnT } from "./untitled-ttrpg.js";

export class ComponentPicker extends FormApplication {
    static get defaultOptions() {
        const defaults = super.defaultOptions;

        const overrides = {
            height: 'auto',
            width: 600,
            id: foundry.utils.randomID(),
            template: UnT.TEMPLATES.ComponentPicker,
            title: "Item.Ability.Component.ComponentPicker.Title",
            userId: game.userId,
            closeOnSubmit: false, // do not close when submitted
            submitOnChange: false, // submit when any input changes
            resizable: true,
        }

        const mergedOptions = foundry.utils.mergeObject(defaults, overrides);

        return mergedOptions
    }

    getData(options) {
        const data = super.getData()

        const components = CONFIG.UnT.abilities.components

        return { 
            data,
            components
        }
    }

    async _updateObject(event, formData) {
        const expandedData = foundry.utils.expandObject(formData);

        UnT.log(false, expandedData)

        this.render();
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