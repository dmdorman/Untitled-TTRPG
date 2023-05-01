import { UnT } from "../untitled-ttrpg.js"
import { addType, removeType } from "../typing.js";
import { attackRoll } from "../combat/attack-roll.js";

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
        if (expandedData[newTypeKey] !== "null" && expandedData[newTypeKey] !== undefined) {
            await addType(this.actor, expandedData[newTypeKey])
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

        const handler = ev => this._onDragStart(ev)
        html.find('.card-header').each((i, li) => {
            li.setAttribute('draggable', true)
            li.addEventListener('dragstart', handler, false)
        });

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

            case ('delete-type'): {
                await removeType(this.actor, clickedElement.data().typeId)

                this.render()

                break;
            }

            case ('item-edit'): {
                const itemId = clickedElement.closest("[data-item-id]").data().itemId
                const relevantItem = this.actor.items.get(itemId)

                relevantItem.sheet.render(true)

                break;
            }

            case ('item-roll'): {
                const itemId = clickedElement.closest("[data-item-id]").data().itemId
                const relevantItem = this.actor.items.get(itemId)

                await attackRoll(relevantItem)

                break;
            }

            default:
                UnT.log(false, 'Invalid action detected', action)
                break;
        }
    }

    async close(options = {}) {
        this.actor.update({'system.inEditMode': false})

        return super.close(options);
    }
}