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
            "root": { "description": "Item.Ability.Component.dice.Root" },
            "1d4": { "cost": 1, "description": "General.EmptyString"},
            "1d6": { "cost": 3, "description": "General.EmptyString"},
            "1d12": { "cost": 5, "description": "General.EmptyString"}
        }
    },
    "defenses": {
        "updefenseself": {
            "root": { "description": "Item.Ability.Component.updefenseself.Root" },
            "minor": { "cost": 2, "description": "Dice.1d4" },
            "major": { "cost": 3, "description": "Dice.1d6" }
        },
        "updefenseothers": {
            "root": { "description": "Item.Ability.Component.updefenseothers.Root" },
            "minor": { "cost": 3, "description": "Dice.1d4" },
            "major": { "cost": 4, "description": "Dice.1d6" }
        },
        "staticdefense": {
            "root": { "description": "Item.Ability.Component.staticdefense.Root" },
            "minor": { "cost": 1, "description": "5" },
            "major": { "cost": 2, "description": "10" },
            "extreme": { "cost": 3, "description": "15" }
        }
    },
    "movement": {
        "dash": {
            "root": { "description": "Item.Ability.Component.dash.Root" },
            "minor": { "cost": 2, "description": "Movement.1x" },
            "major": { "cost": 3, "description": "Movement.2x" },
            "extreme": { "cost": 4, "description": "Movement.4x" }
        },
        "teleport": {
            "root": { "description": "Item.Ability.Component.teleport.Root" },
            "minor": { "cost": 3, "description": "Movement.1x" },
            "major": { "cost": 4, "description": "Movement.2x" },
            "extreme": { "cost": 5, "description": "Movement.4x" }
        },
        "fly": {
            "root": { "description": "Item.Ability.Component.fly.Root" },
            "minor": { "cost": 3, "description": "Movement.1x" },
            "major": { "cost": 4, "description": "Movement.2x" },
            "extreme": { "cost": 5, "description": "Movement.4x" }
        }
    },
    "control": {
        "pull": {
            "root": { "description": "Item.Ability.Component.pull.Root" },
            "minor": { "cost": 1, "description": "1m" },
            "major": { "cost": 2, "description": "5m" },
            "extreme": { "cost": 3, "description": "25m" }
        },
        "push": {
            "root": { "description": "Item.Ability.Component.push.Root" },
            "minor": { "cost": 1, "description": "1m" },
            "major": { "cost": 2, "description": "5m" },
            "extreme": { "cost": 3, "description": "25m" }
        },
        "manipulate": {
            "root": { "description": "Item.Ability.Component.manipulate.Root" },
            "minor": { "cost": 3, "description": "5m" },
            "major": { "cost": 4, "description": "25m" }
        }
    },
    "utility": {
        "sizechange": {
            "root": { "description": "Item.Ability.Component.sizechange.Root" },
            "minor": { "cost": 1, "description": "Item.Ability.Component.sizechange.Minor" },
            "major": { "cost": 2, "description": "Item.Ability.Component.sizechange.Major" },
            "fullcontrol": { "cost": 3, "description": "Item.Ability.Component.sizechange.FullControl" }
        }
    },
    "advantages": {
        "ranged": {
            "root": { "description": "Item.Ability.Component.ranged.Root" },
            "short": { "cost": 1, "description": "Item.Ability.Component.ranged.Short" },
            "medium": { "cost": 2, "description": "Item.Ability.Component.ranged.Medium" },
            "far": { "cost": 3, "description": "Item.Ability.Component.ranged.Far" }
        },
        "areaofeffectcircle": {
            "root": { "description": "Item.Ability.Component.areaofeffectcircle.Root" },
            "small": { "cost": 1, "description": "1m" },
            "medium": { "cost": 2, "description": "3m" },
            "large": { "cost": 3, "description": "5m" }
        },
        "areaofeffectcone": {
            "root": { "description": "Item.Ability.Component.areaofeffectcone.Root" },
            "small": { "cost": 1, "description": "5m" },
            "medium": { "cost": 2, "description": "10m" },
            "large": { "cost": 3, "description": "15m" }
        },
        "areaofeffectline": {
            "root": { "description": "Item.Ability.Component.areaofeffectline.Root" },
            "small": { "cost": 1, "description": "5m" },
            "medium": { "cost": 2, "description": "25m" },
            "large": { "cost": 3, "description": "125m" }
        },
        "areaofeffectadvantages": {
            "root": { "description": "Item.Ability.Component.areaofeffectadvantages.Root" },
            "smarttargeting": { "cost": 1, "description": "Item.Ability.Component.areaofeffectadvantages.SmartTargeting" }
        },
        "other": {
            "root": { "description": "Item.Ability.Component.other.Root" },
            "doesntrequireextremities": { "cost": 2, "description": "Item.Ability.Component.doesntrequireextremities.Description" },
            "physicalitem": { "cost": 0, "description": "Item.Ability.Component.physicalitem.Description" }
        }
    },
    "disadvantages": {
        "hurtstouse": {
            "root": { "description": "Item.Ability.Component.hurtstouse.Root" },
            "minor": { "cost": -2, "description": "Item.Ability.Component.hurtstouse.Minor" },
            "major": { "cost": -3, "description": "Item.Ability.Component.hurtstouse.Major" },
            "massive": { "cost": -4, "description": "Item.Ability.Component.hurtstouse.Massive" },
            "extreme": { "cost": -5, "description": "Item.Ability.Component.hurtstouse.Extreme" }
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
