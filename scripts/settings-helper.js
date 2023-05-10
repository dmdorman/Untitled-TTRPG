import { UnT } from "./untitled-ttrpg.js";

Hooks.on("init", function() {
    game.settings.register(UnT.ID, 'typing', {
        name: 'Settings.Typing.Name',
        hint: 'This is a setting that controls type interactions.',
        scope: 'world',
        config: false,
        type: String,
        default: '{}',
        onChange: value => {
            UnT.log(false, `Setting "Typing" changed to ${value}`);
        },
    });

    game.settings.register(UnT.ID, 'inCharacterCreation', {
        name: game.i18n.localize('Settings.inCharacterCreation.Name'),
        hint: game.i18n.localize('Settings.inCharacterCreation.Hint'),
        scope: 'world',
        config: true,
        type: Boolean,
        default: 0,
        onChange: value => {
            UnT.log(false, `Setting "inCharacterCreation" changed to ${value}`);

            game.socket.emit(UnT.SOCKET, { type:'update', options: {} });

            Hooks.call('update')
        },
    });

    game.settings.register(UnT.ID, 'hpBudget', {
        name: game.i18n.localize('Settings.hpBudget.Name'),
        hint: game.i18n.localize('Settings.hpBudget.Hint'),
        scope: 'world',
        config: true,
        type: Number,
        default: 0,
        onChange: value => {
            UnT.log(false, `Setting "hpBudget" changed to ${value}`);
        },
    });

    game.settings.register(UnT.ID, 'apBudget', {
        name: game.i18n.localize('Settings.apBudget.Name'),
        hint: game.i18n.localize('Settings.apBudget.Hint'),
        scope: 'world',
        config: true,
        type: Number,
        default: 0,
        onChange: value => {
            UnT.log(false, `Setting "apBudget" changed to ${value}`);
        },
    });

    game.settings.register(UnT.ID, 'armorBudget', {
        name: game.i18n.localize('Settings.ArmorBudget.Name'),
        hint: game.i18n.localize('Settings.ArmorBudget.Hint'),
        scope: 'world',
        config: true,
        type: Number,
        default: 0,
        onChange: value => {
            UnT.log(false, `Setting "ArmorBudget" changed to ${value}`);
        },
    });

    game.settings.register(UnT.ID, 'abilityBudget', {
        name: game.i18n.localize('Settings.AbilityBudget.Name'),
        hint: game.i18n.localize('Settings.AbilityBudget.Hint'),
        scope: 'world',
        config: true,
        type: Number,
        default: 0,
        onChange: value => {
            UnT.log(false, `Setting "AbilityBudget" changed to ${value}`);
        },
    });

    game.settings.register(UnT.ID, 'skillsBudget', {
        name: game.i18n.localize('Settings.SkillsBudget.Name'),
        hint: game.i18n.localize('Settings.SkillsBudget.Hint'),
        scope: 'world',
        config: true,
        type: Number,
        default: 0,
        onChange: value => {
            UnT.log(false, `Setting "SkillsBudget" changed to ${value}`);
        },
    });
});
