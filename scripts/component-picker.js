import { UnT } from "./untitled-ttrpg.js";

export class ComponentPicker extends FormApplication {
    static get defaultOptions() {
        const defaults = super.defaultOptions;

        const overrides = {
            height: 600,
            width: 600,
            id: foundry.utils.randomID(),
            template: UnT.TEMPLATES.ComponentPicker,
            title: "Item.Ability.Component.ComponentPicker.Title",
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

        const components = CONFIG.UnT.abilities.components

        const cost = getAbilityCost(this.object.item)

        return { 
            data,
            item: this.object.item,
            components,
            cost
        }
    }

    async _updateObject(event, formData) {
        const expandedData = foundry.utils.expandObject(formData);

        await this.object.item.update(expandedData)

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

export function getAbilityCost(item) {
    const activeComponentKeys = findActiveComponents(item.system.components)

    let cost = 0

    for (const key of activeComponentKeys) {
        let component = CONFIG.UnT.abilities.components

        for (const partialKey of key) {
            component = component[partialKey]
        }

        cost += component['cost']        
    }

    const apCost = Math.ceil(cost / 5)

    item.update({"system.pointBuyCost": cost, "system.apCost": apCost})

    return cost
}

export function findActiveComponents(components, path = []) {
    const activeComponents = [];

    for (const key in components) {
        const value = components[key];

        const currentPath = [...path, key];

        if (value === true) {
            activeComponents.push(currentPath);
        } else if (typeof value === 'object' && value !== null) {
            activeComponents.push(...findActiveComponents(value, currentPath));
        }
    }

    return activeComponents;
}