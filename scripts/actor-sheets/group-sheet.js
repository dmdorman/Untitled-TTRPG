import { UnT } from "../untitled-ttrpg.js"

export class GroupActorSheet extends ActorSheet {
    static get defaultOptions() {
        const defaults = super.defaultOptions;

        const overrides = {
            height: 'auto',
            width: 600,
            id: foundry.utils.randomID(),
            template: UnT.TEMPLATES.GroupActorSheet,
            title: "Group.Sheet.Title",
            userId: game.userId,
            closeOnSubmit: false, // do not close when submitted
            submitOnChange: true, // submit when any input changes
            resizable: true,
        }

        const mergedOptions = foundry.utils.mergeObject(defaults, overrides);

        return mergedOptions
    }

    async getData() {
        const data = super.getData()

        const actors = GroupActorData.getActorsByIds(this.actor.system.linkedIds)

        return {
            data,
            actors
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
            case 'create-actor': {
                const actor = await Actor.create({ name: 'New Actor', type: 'pc',  permission: { default: 2, [game.userId]: 3 } })

                const linkedIds = this.actor.system.linkedIds
                linkedIds.push(actor._id)

                await this.actor.update({'system.linkedIds': linkedIds})

                this.render();
                break;
            }

            case 'open-actor': {
                const actorId = clickedElement.closest("[data-actor-id]").data().actorId

                const actor = game.actors.get(actorId)

                const sheetClass = actor._getSheetClass()

                const sheet = new sheetClass(actor)

                sheet.render(true)

                break;
            }

            case 'add-actor': {
                const actorPickerForm = new ActorPicker({ actor: this.actor })

                actorPickerForm.render(true)

                break;
            }

            default:
                UnT.log(false, 'Invalid action detected', action)
                break;
        }
    }
}

export class GroupActorData {
    static getCharactersByUser(userId) {
        const ownedActors = game.actors
            .filter(actor => userId in actor.ownership)
            .filter(actor => actor.type !== 'group')
            .map(actor => actor.id)

        return ownedActors;
    }

    static getActorsByIds(idList) {        
        const actors = [];
        for (const actorId of idList) {
            actors.push(game.actors.get(actorId))
        }

        return actors;
    }
}

export class ActorPicker extends FormApplication {
    static get defaultOptions() {
        const defaults = super.defaultOptions;

        const overrides = {
            height: 'auto',
            width: 600,
            id: foundry.utils.randomID(),
            template: UnT.TEMPLATES.ActorPicker,
            title: "Group.Sheet.ActorPicker.Title",
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

        let actorIds = [];
        for (const key in this.object.actor.ownership) {
            if (key === 'default') { continue; }

            if (this.object.actor.hasPlayerOwner && game.users.get(key).isGM) { continue; }

            actorIds = [...actorIds, ...GroupActorData.getCharactersByUser(key)]            
        }

        const filteredActorIds = actorIds.filter((value) => !this.object.actor.system.linkedIds.includes(value))

        const actors = GroupActorData.getActorsByIds(filteredActorIds)

        const isGM = game.user.isGM

        return { 
            data,
            actors,
            isGM
        }
    }

    async _updateObject(event, formData) {
        const expandedData = foundry.utils.expandObject(formData);
            
        const actorsToAdd = Object.keys(expandedData).filter((key) => expandedData[key])

        const linkedIds = this.object.actor.system.linkedIds

        for (const actorId of actorsToAdd) {
            if (linkedIds.includes(actorId)) { continue; }

            linkedIds.push(actorId)
        }

        await this.object.actor.update({'system.linkedIds': linkedIds})

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
            case 'submit': {
                break;
            }

            default:
                UnT.log(false, 'Invalid action detected', action)
                break;
        }
    }
}