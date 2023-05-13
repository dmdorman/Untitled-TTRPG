export const Rules = {};

Rules.dice = {
    "attackDie": {
        "dice": "1d10",
        "explodesOn": "10"
    }
}

Rules.hitsOn = 7

Rules.bonusHitsOn = 7
Rules.bonusAttackHaveTypeInteractions = false

Rules.defenseOblatesOn = 5

Rules.sizes = [
    "tiny",
    "small",
    "medium",
    "large",
    "huge",
    "gigantic"
]

Rules.hitZones = {
    "zones": {
        "WeakPoint": { "damageMod": 2,  "aimPenalty": -2 },
        "CoM": { "damageMod": 1, "aimPenalty": 0 },
        "Extremities": { "damageMod": 0.5, "aimPenalty": -1 }
    },
    "roll": {
        "1": "Extremities",
        "2": "Extremities",
        "3": "Extremities",
        "4": "Extremities",
        "5": "CoM",
        "6": "CoM",
        "7": "CoM",
        "8": "CoM",
        "9": "WeakPoint",
        "10": "WeakPoint"
    }
}

Rules.abilities = {}
Rules.abilities.componentsPerOneCost = 3
Rules.abilities.components = {
    "attacks": {
        "dice": {
            "1d4": { "cost": 1, "description": "Abilities.Components.Attacks.Dice.1d4"},
            "1d6": { "cost": 3, "description": "Abilities.Components.Attacks.Dice.1d6"},
            // "1d8": { "cost": 3, "description": "Abilities.Components.Attacks.Dice.1d8"},
            // "1d10": { "cost": 4, "description": "Abilities.Components.Attacks.Dice.1d10"},
            "1d12": { "cost": 5, "description": "Abilities.Components.Attacks.Dice.1d12"}
        }
    },
    "defenses": {
        "updefenseself": {
            "minor": { "cost": 2, "description": "Abilities.Components.Defenses.UpDefensesSelf.Minor" },
            "major": { "cost": 3, "description": "Abilities.Components.Defenses.UpDefensesSelf.Major" }
        },
        "updefenseothers": {
            "minor": { "cost": 3, "description": "Abilities.Components.Defenses.UpDefensesOthers.Minor" },
            "major": { "cost": 4, "description": "Abilities.Components.Defenses.UpDefensesOthers.Major" }
        },
        "staticdefense": {
            "minor": { "cost": 1, "description": "Abilities.Components.Defenses.StaticDefense.Minor" },
            "major": { "cost": 2, "description": "Abilities.Components.Defenses.StaticDefense.Major" },
            "extreme": { "cost": 3, "description": "Abilities.Components.Defenses.StaticDefense.Extreme" }
        }
    },
    "movement": {
        "dash": {
            "minor": { "cost": 2, "description": "Abilities.Components.Movement.Dash.Minor" },
            "major": { "cost": 3, "description": "Abilities.Components.Movement.Dash.Major" },
            "extreme": { "cost": 4, "description": "Abilities.Components.Movement.Dash.Extreme" }
        },
        "teleport": {
            "minor": { "cost": 3, "description": "Abilities.Components.Movement.Teleport.Minor" },
            "major": { "cost": 4, "description": "Abilities.Components.Movement.Teleport.Major" },
            "extreme": { "cost": 5, "description": "Abilities.Components.Movement.Teleport.Extreme" }
        }
    },
    "control": {
        "pull": {
            "minor": { "cost": 1, "description": "Abilities.Components.Control.Pull.Minor" },
            "major": { "cost": 2, "description": "Abilities.Components.Control.Pull.Major" },
            "extreme": { "cost": 3, "description": "Abilities.Components.Control.Pull.Extreme" }
        },
        "push": {
            "minor": { "cost": 1, "description": "Abilities.Components.Control.Push.Minor" },
            "major": { "cost": 2, "description": "Abilities.Components.Control.Push.Major" },
            "extreme": { "cost": 3, "description": "Abilities.Components.Control.Push.Extreme" }
        },
        "manipulate": {
            "minor": { "cost": 3, "description": "Abilities.Components.Control.Manipulate.Minor" },
            "major": { "cost": 4, "description": "Abilities.Components.Control.Manipulate.Major" }
        }
    },
    "utility": {
        "sizechange": {
            "minor": { "cost": 1, "description": "Abilities.Components.Utility.SizeChange.Minor" },
            "major": { "cost": 2, "description": "Abilities.Components.Utility.SizeChange.Major" },
            "fullcontrol": { "cost": 3, "description": "Abilities.Components.Utility.SizeChange.FullControl" }
        }
    },
    "advantages": {
        "ranged": {
            "short": { "cost": 1, "description": "Abilities.Components.Advantages.Ranged.Short" },
            "medium": { "cost": 2, "description": "Abilities.Components.Advantages.Ranged.Medium" },
            "far": { "cost": 3, "description": "Abilities.Components.Advantages.Ranged.Large" }
        },
        "areaofeffectcircle": {
            "small": { "cost": 1, "description": "Abilities.Components.Advantages.AreaOfEffect.Circle.Small" },
            "medium": { "cost": 2, "description": "Abilities.Components.Advantages.AreaOfEffect.Circle.Medium" },
            "large": { "cost": 3, "description": "Abilities.Components.Advantages.AreaOfEffect.Circle.Large" }
        },
        "areaofeffectcone": {
            "small": { "cost": 1, "description": "Abilities.Components.Advantages.AreaOfEffect.Cone.Small" },
            "medium": { "cost": 2, "description": "Abilities.Components.Advantages.AreaOfEffect.Cone.Medium" },
            "large": { "cost": 3, "description": "Abilities.Components.Advantages.AreaOfEffect.Cone.Large" }
        },
        "areaofeffectline": {
            "small": { "cost": 1, "description": "Abilities.Components.Advantages.AreaOfEffect.Line.Small" },
            "medium": { "cost": 2, "description": "Abilities.Components.Advantages.AreaOfEffect.Line.Medium" },
            "large": { "cost": 3, "description": "Abilities.Components.Advantages.AreaOfEffect.Line.Large" }
        },
        "areaofeffectadvantages": {
            "smarttargeting": { "cost": 1, "description": "Abilities.Components.Advantages.AreaOfEffect.Advantages.SmartTargeting" }
        },
        "other": {
            "doesntrequireextremities": { "cost": 2, "description": "Abilities.Components.Advantages.Other.DoesntRequireExtremities" },
            "physicalitem": { "cost": 0, "description": "Abilities.Components.Advantages.AreaOfEffect.Other.PhysicalItem" }
        }
    },
    "disadvantages": {
        "hurtstouse": {
            "minor": { "cost": -2, "description": "Abilities.Components.Disadvantages.HurtsToUse.Minor" },
            "major": { "cost": -3, "description": "Abilities.Components.Disadvantages.HurtsToUse.Major" },
            "massive": { "cost": -4, "description": "Abilities.Components.Disadvantages.HurtsToUse.Massive" },
            "extreme": { "cost": -5, "description": "Abilities.Components.Disadvantages.HurtsToUse.Extreme" }
        }
    }
}

Rules.perks = {
    "Accurate": { "accuracyBuff": 1},
    "Berserker": {},
    "HardToHit": { "accuracyDebuff": -1 },
    "Amorphous": {
        "zones": {
            "WeakPoint": { "damageMod": 1, "aimPenalty": 0 },
            "CoM": { "damageMod": 1, "aimPenalty": 0 },
            "Extremities": { "damageMod": 1, "aimPenalty": 0 }
        },
    },
    "NoWeakPoints": {
        "zones": {
            "WeakPoint": { "damageMod": 1, "aimPenalty": 0 },
            "CoM": { "damageMod": 1, "aimPenalty": 0 },
            "Extremities": { "damageMod": 0.5, "aimPenalty": -1 }
        },
    }
}
