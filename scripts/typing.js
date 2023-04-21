import { UnT } from "./untitled-ttrpg.js";

export class TypingForm extends FormApplication {
    static get defaultOptions() {
        const defaults = super.defaultOptions;

        const overrides = {
            height: 'auto',
            width: 'auto',
            id: foundry.utils.randomID(),
            template: UnT.TEMPLATES.TypesForm,
            title: "SceneControl.Types.Title",
            userId: game.userId,
            closeOnSubmit: false, // do not close when submitted
            submitOnChange: true, // submit when any input changes
            resizable: true,
        }

        const mergedOptions = foundry.utils.mergeObject(defaults, overrides);

        return mergedOptions
    }

    getData(options) {
        const data = super.getData()

        return { 
            data,
            typing: JSON.parse(game.settings.get(UnT.ID, 'typing'))
        }
    }

    async _updateObject(event, formData) {
        const expandedData = foundry.utils.expandObject(formData);
            
        const typing = JSON.parse(game.settings.get(UnT.ID, 'typing'))

        UnT.log(false, typing)

        for (const [field, value]  of Object.entries(expandedData)) {
            if (field.includes('interactions')) {
                this.setTypeInteractions(typing, field, value)
            }
        }

        await game.settings.set(UnT.ID, 'typing', JSON.stringify(typing))

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

    setTypeInteractions(typing, field, value) {
        const [_, type1, type2] = field.split('-')

        if (!typing[type1].interactions) {
            typing[type1].interactions = {}
        }

        if (!typing[type2].interactions) {
            typing[type2].interactions = {}
        }

        if (value === null) {
            typing[type1]['interactions'][type2] = 1
            typing[type2]['interactions'][type1] = 1
        } else {
            typing[type1]['interactions'][type2] = value
            typing[type2]['interactions'][type1] = value
        }
    }
}