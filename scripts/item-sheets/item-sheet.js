import { UnT } from "../untitled-ttrpg.js";

import { removeType } from "../typing.js";

export class UnTItemSheet extends ItemSheet {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["UnT", "sheet", "item"],
            width: 'auto',
            height: 'auto',
        });
    }

    get template() {
        return `systems/${UnT.ID}/templates/items/${this.item.type}-sheet.hbs`
    }

    async getData() {
        const data = await super.getData();

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

    async _updateObject(event, formData) {
        await super._updateObject(event, formData)    

        const expandedData = foundry.utils.expandObject(formData);

        if (expandedData['new-type'] !== 'null') {
            await this.item.update({'system.types': [expandedData['new-type']]})
        }

        this.render();
    }

    async _handleButtonClick(event) {
        const clickedElement = $(event.currentTarget);
        const action = clickedElement.data().action;

        switch(action) {
            case ('set-editable'): {
                const inEditMode = this.item.system.inEditMode;

                this.item.update({'system.inEditMode': !inEditMode})

                break;
            }

            case ('delete-type'): {
                await removeType(this.item, clickedElement.data().typeId)

                this.render()

                break;
            }

            default:
                UnT.log(false, 'Invalid action detected', action)
                break;
        }
    }
}