export const Rules = {};

Rules.sizes = {
    "tiny": [],
    "small": [],
    "medium": [],
    "large": [],
    "huge": [],
    "gigantic": []
}

Rules.abilities = {}
Rules.abilities.components = {
    "attacks": {
        "dice": {
            "1d4": { cost: 1, description: "Abilities.Components.Attacks.Dice.1d4"},
            "1d6": { cost: 2, description: "Abilities.Components.Attacks.Dice.1d6"},
            "1d8": { cost: 3, description: "Abilities.Components.Attacks.Dice.1d8"},
            "1d10": { cost: 4, description: "Abilities.Components.Attacks.Dice.1d10"},
            "1d12": { cost: 5, description: "Abilities.Components.Attacks.Dice.1d12"}
        }
    },
    "defenses": {
        "updefenseself": {
            "minor": { cost: 2, description: "Abilities.Components.Defenses.UpDefensesSelf.Minor" },
            "major": { cost: 3, description: "Abilities.Components.Defenses.UpDefensesSelf.Major" }
        },
        "updefenseothers": {
            "minor": { cost: 3, description: "Abilities.Components.Defenses.UpDefensesOthers.Minor" },
            "major": { cost: 4, description: "Abilities.Components.Defenses.UpDefensesOthers.Major" }
        },
        "staticdefense": {
            "minor": { cost: 1, description: "Abilities.Components.Defenses.StaticDefense.Minor" },
            "major": { cost: 2, description: "Abilities.Components.Defenses.StaticDefense.Major" },
            "extreme": { cost: 3, description: "Abilities.Components.Defenses.StaticDefense.Extreme" }
        }
    },
    "movement": {
        "dash": {
            "minor": { cost: 2, description: "Abilities.Components.Movement.Dash.Minor" },
            "major": { cost: 3, description: "Abilities.Components.Movement.Dash.Major" },
            "extreme": { cost: 4, description: "Abilities.Components.Movement.Dash.Extreme" }
        },
        "teleport": {
            "minor": { cost: 3, description: "Abilities.Components.Movement.Teleport.Minor" },
            "major": { cost: 4, description: "Abilities.Components.Movement.Teleport.Major" },
            "extreme": { cost: 5, description: "Abilities.Components.Movement.Teleport.Extreme" }
        },
    },
    "control": {
        "pull": {},
        "push": {},
        "manipulate": {}
    },
    "utility": {

    },
    "advantages": {

    },
    "disadvantages": {
        
    }
}