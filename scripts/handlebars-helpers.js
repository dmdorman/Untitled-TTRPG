export function initializeHandlebarsHelpers() {
    Handlebars.registerHelper('dynamicPartial', async function (ID, partialName, options) {
        // Get the path to the partial
        const partialPath = `systems/${ID}/templates/partials/${partialName}`;

        console.log(ID)
        console.log(partialName)
        console.log(partialPath)

        // Load and compile the partial
        const partialTemplate = await renderTemplate(partialPath);
        const compiledTemplate = Handlebars.compile(partialTemplate);

        // Render the compiled partial with provided context
        return new Handlebars.SafeString(compiledTemplate(options.hash));
    });
}