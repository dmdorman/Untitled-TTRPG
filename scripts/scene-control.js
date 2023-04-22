import { TypingForm } from "./typing.js";

Hooks.once("init", async function () {
    const layers = { UnT: { layerClass: UnTLayer, group: "primary" } }
    CONFIG.Canvas.layers = foundry.utils.mergeObject(Canvas.layers, layers);
})

Hooks.on('getSceneControlButtons', (buttons) => {
    const UnTTool = {
        activeTool: "types",
        icon: "scene-control-icon",
        layer: "UnT",
        name: "UnT",
        title: game.i18n.localize("UnT.Name"),
        tools: [],
        visible: true
    }

    UnTTool.tools.push({
        name: "types",
        icon: "scene-control-icon-types",
        title: game.i18n.localize("UnT.SceneControl.Types"),
        button: true,
        onClick: () => {
            const typeForm = new TypingForm()
            typeForm.render(true)
        },
    })

    if(game.user.isGM) {
       // GM only controls
    }

    buttons.push(UnTTool)
})

export class UnTLayer extends PlaceablesLayer {
    constructor(...args) {
        super(...args);

        this.documentName = "Scene"

        this.isSetup = false;
    }

    static get layerOptions() {
        return foundry.utils.mergeObject(super.layerOptions, {
        zIndex: 180,
        name: "UnT"
    });
    }

    getDocuments() {
        return []
    }

    activate() {
        super.activate();
    }

    deactivate() {
        super.deactivate();
    }

    render(...args) {
        super.render(...args);
    }
}