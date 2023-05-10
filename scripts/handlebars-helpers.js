import { getTyping, defaultColor } from "./typing.js";
import { UnT } from "./untitled-ttrpg.js";

export function initializeHandlebarsHelpers() {
    Handlebars.registerHelper('dynamicPartial', async function (ID, partialName, options) {
        // Get the path to the partial
        const partialPath = `systems/${ID}/templates/partials/${partialName}`;

        // Load and compile the partial
        const partialTemplate = await renderTemplate(partialPath);
        const compiledTemplate = Handlebars.compile(partialTemplate);

        // Render the compiled partial with provided context
        return new Handlebars.SafeString(compiledTemplate(options.hash));
    });

    Handlebars.registerHelper('isEditable', function(actor, options) {
        return actor.system.inEditMode ? 'enabled' : 'disabled';
    });

    Handlebars.registerHelper('getHeaderBackgroundColor', function(item) {
        const typing = getTyping()

        if (item.system.types === 0) { return defaultColor; }

        if (!item.system.types[0] in typing) { return defaultColor; }

        const typeKey = item.system.types[0]

        try {
            return typing[typeKey].color
        } catch(error) {
            return defaultColor
        }
    });

    Handlebars.registerHelper('getHeaderTextColor', function(item) {
        const typing = getTyping()

        if (item.system.types === 0) { return "#fff"; }

        if (!item.system.types[0] in typing) { return "#fff"; }

        const typeKey = item.system.types[0]

        try {
            return typing[typeKey].textColor
        } catch(error) {
            return "#fff"
        }
    });

    Handlebars.registerHelper('localizeVariableKey', function (leadingString, key, tailingString, options) {
        const localizationKey = (typeof tailingString === 'string')? `${leadingString}.${key}.${tailingString}`: `${leadingString}.${key}`;

        const localizedValue = game.i18n.localize(localizationKey) || localizationKey;

        return new Handlebars.SafeString(localizedValue);
    });

    Handlebars.registerHelper('hasComponent', function(item, typeId, componentId, optionId, options) {
        if (item.system.components === undefined) { return false; }

        if (item.system.components[typeId] === undefined) { return false; }

        if (item.system.components[typeId][componentId] === undefined) { return false; }

        const value = item.system.components[typeId][componentId][optionId]

        return value
    });

    Handlebars.registerHelper('getArmor', function(actor, key) {
        if (actor?.flags?.UnT === undefined) { return 0; }

        const output = Object.values(actor.flags.UnT).reduce((acc, item) => acc + item[key], 0)

        return output
    })
}