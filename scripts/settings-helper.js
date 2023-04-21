import { UnT } from "./untitled-ttrpg.js";

Hooks.on("init", function() {
    game.settings.register(UnT.ID, 'typing', {
        name: 'Settings.Typing.Name`',
        hint: 'This is a setting that controls type interactions.',
        scope: 'world',
        config: false,
        type: String,
        default: '{}',
        onChange: value => {
            UnT.log(false, `Setting "Typing" changed to ${value}`);
        },
    });
});
