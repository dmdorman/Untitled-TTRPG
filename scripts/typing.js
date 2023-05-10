import { UnT } from "./untitled-ttrpg.js";

export class TypingForm extends FormApplication {
    static get defaultOptions() {
        const defaults = super.defaultOptions;

        const overrides = {
            height: 'auto',
            width: 'auto',
            id: 'TypingForm',
            template: UnT.TEMPLATES.TypesForm,
            title: "Types.Title",
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

        const isGM = game.user.isGM

        return { 
            data,
            isGM,
            typing: JSON.parse(game.settings.get(UnT.ID, 'typing'))
        }
    }

    async _updateObject(event, formData) {
        const expandedData = foundry.utils.expandObject(formData);
            
        const typing = getTyping()

        for (const [field, value]  of Object.entries(expandedData)) {
            if (field.includes('interactions')) {
                this.setTypeInteractions(typing, field, value)
            }
        }

        await game.settings.set(UnT.ID, 'typing', JSON.stringify(typing))

        this.render();
    }

    activateListeners(html) {
        super.activateListeners(html);

        if (game.user.isGM) {
            html.on('click', "[data-action]", this._handleButtonClick.bind(this));
        }

        game.socket.on(UnT.SOCKET, (options) => {
            switch (options.type) {
                case ('update-type'): {
                    this.render();
                }

                default: {
                    break;
                }
            }
        });

        Hooks.on('updateType', (options) => {
            this.render();
        });
    }

    async _handleButtonClick(event) {
        const clickedElement = $(event.currentTarget);
        const action = clickedElement.data().action;

        switch(action) {
            case ('add-type'): {
                const typing = getTyping()

                const placeholderName = game.i18n.localize("Types.DefaultName")

                typing[foundry.utils.randomID()] = {
                    name: placeholderName,
                    interactions: {},
                }

                await game.settings.set(UnT.ID, 'typing', JSON.stringify(typing))

                this.render()

                break;
            }

            case ('edit-tag'): {
                const typeId = clickedElement.data().type

                const typeEditor = new TypeEditor({typeId})

                typeEditor.render(true)

                break;
            }

            default:
                UnT.log(false, 'Invalid action detected', action)
                break;
        }
    }

    setTypeInteractions(typing, field, value) {
        const [_, type1, type2] = field.split('-')

        if (!typing[type1].interactions) {
            typing[type1].interactions = {}
        }

        if (value === null) {
            typing[type1]['interactions'][type2] = 1
        } else {
            typing[type1]['interactions'][type2] = value
        }
    }
}

export class TypeEditor extends FormApplication {
    static get defaultOptions() {
        const defaults = super.defaultOptions;

        const overrides = {
            height: 'auto',
            width: 'auto',
            id: foundry.utils.randomID(),
            template: UnT.TEMPLATES.TypeEditor,
            title: "Types.TypeEditor.Title",
            userId: game.userId,
            closeOnSubmit: true, // do not close when submitted
            submitOnChange: false, // submit when any input changes
            resizable: true,
        }

        const mergedOptions = foundry.utils.mergeObject(defaults, overrides);

        return mergedOptions
    }

    getData(options) {
        const data = super.getData()

        const typing = getTyping()

        return { 
            data,
            typeData: typing[this.object.typeId] 
        }
    }

    async _updateObject(event, formData) {
        const expandedData = foundry.utils.expandObject(formData);

        const typing = getTyping()

        for (const [field, value]  of Object.entries(expandedData)) {
            if (!typing[this.object.typeId][field]) {
                typing[this.object.typeId][field] = ""
            }

            if (field === 'color') {
                const textColor = this.getTextColor(value)
                typing[this.object.typeId].textColor = textColor
            }

            typing[this.object.typeId][field] = value
        }

        await game.settings.set(UnT.ID, 'typing', JSON.stringify(typing))

        this.render();

        this._callUpdate()
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.on('click', "[data-action]", this._handleButtonClick.bind(this));
    }

    async _handleButtonClick(event) {
        const clickedElement = $(event.currentTarget);
        const action = clickedElement.data().action;

        switch(action) {
            case ('delete'): {
                const confirmed = await Dialog.confirm({
                    title: game.i18n.localize("Types.TypeEditor.Confirm.Title"),
                    content: game.i18n.localize("Types.TypeEditor.Confirm.Delete")
                });

                if (confirmed) {
                    const typing = getTyping()

                    delete typing[this.object.typeId]

                    await game.settings.set(UnT.ID, 'typing', JSON.stringify(typing))

                    this._callUpdate()

                    this.close();
                }

                break;
            }

            default:
                UnT.log(false, 'Invalid action detected', action)
                break;
        }
    }

    _callUpdate() {
        Hooks.call('updateType', {});

        game.socket.emit(UnT.SOCKET, { type:'update-type', options: {} });
    }

    getTextColor(color) {
        const rgbColor = toRGBColor(color)

        if (isBrightColor(rgbColor)) {
            return "#000" // black
        }

        return "#fff" // white
    }
}

export function getTyping() {
    return JSON.parse(game.settings.get(UnT.ID, 'typing'))
}

export async function addType(object, typeKey) {
    if (!(typeKey === 'null') && !(object.system.types.includes(typeKey))) {
        const types = object.system.types;
        types.push(typeKey)

        await object.update({'system.types': types})
    }
}

export async function removeType(object, typeKey) {
    const types = object.system.types

    const filteredTypes = types.filter((e) => e !== typeKey).filter((e) => e !== null)

    await object.update({'system.types': filteredTypes})
}

export function isBrightColor(color) {
    const [r, g, b] = color.match(/\d+/g);

    const brightness = (r * 299 + g * 587 + b * 114) / 1000;

    return brightness > (0.57 * 255);  // brightness threshold
}

export function toRGBColor(color) {
    const colorNameToHex = cssColors

    const defaultColor = "#a8a878"

    function isColorString(str) {
        const colorRegex = /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/;
        return colorRegex.test(str);
    }

    function isValidHex(hex) {
        return /^#([0-9A-Fa-f]{3}){1,2}$/.test(hex);
    }

    function hexToRGB(hex) {
        let r, g, b;

        if (hex.length === 4) {
            r = parseInt(hex[1] + hex[1], 16);
            g = parseInt(hex[2] + hex[2], 16);
            b = parseInt(hex[3] + hex[3], 16);
        } else {
            r = parseInt(hex.slice(1, 3), 16);
            g = parseInt(hex.slice(3, 5), 16);
            b = parseInt(hex.slice(5, 7), 16);
        }

        return `rgb(${r}, ${g}, ${b})`;
    }

    if (isColorString(color)) {
        return color
    }

    if (colorNameToHex.hasOwnProperty(color.toLowerCase())) {
        color = colorNameToHex[color.toLowerCase()];
    }

    if (!isValidHex(color)) {
        color = defaultColor;
    }

    return hexToRGB(color);
}

export const defaultColor = "#a8a878"

export const cssColors = {
    "aliceblue": "#F0F8FF",
    "antiquewhite": "#FAEBD7",
    "aqua": "#00FFFF",
    "aquamarine": "#7FFFD4",
    "azure": "#F0FFFF",
    "beige": "#F5F5DC",
    "bisque": "#FFE4C4",
    "black": "#000000",
    "blanchedalmond": "#FFEBCD",
    "blue": "#0000FF",
    "blueviolet": "#8A2BE2",
    "brown": "#A52A2A",
    "burlywood": "#DEB887",
    "cadetblue": "#5F9EA0",
    "chartreuse": "#7FFF00",
    "chocolate": "#D2691E",
    "coral": "#FF7F50",
    "cornflowerblue": "#6495ED",
    "cornsilk": "#FFF8DC",
    "crimson": "#DC143C",
    "cyan": "#00FFFF",
    "darkblue": "#00008B",
    "darkcyan": "#008B8B",
    "darkgoldenrod": "#B8860B",
    "darkgray": "#A9A9A9",
    "darkgrey": "#A9A9A9",
    "darkgreen": "#006400",
    "darkkhaki": "#BDB76B",
    "darkmagenta": "#8B008B",
    "darkolivegreen": "#556B2F",
    "darkorange": "#FF8C00",
    "darkorchid": "#9932CC",
    "darkred": "#8B0000",
    "darksalmon": "#E9967A",
    "darkseagreen": "#8FBC8F",
    "darkslateblue": "#483D8B",
    "darkslategray": "#2F4F4F",
    "darkslategrey": "#2F4F4F",
    "darkturquoise": "#00CED1",
    "darkviolet": "#9400D3",
    "deeppink": "#FF1493",
    "deepskyblue": "#00BFFF",
    "dimgray": "#696969",
    "dimgrey": "#696969",
    "dodgerblue": "#1E90FF",
    "firebrick": "#B22222",
    "floralwhite": "#FFFAF0",
    "forestgreen": "#228B22",
    "fuchsia": "#FF00FF",
    "gainsboro": "#DCDCDC",
    "ghostwhite": "#F8F8FF",
    "gold": "#FFD700",
    "goldenrod": "#DAA520",
    "gray": "#808080",
    "grey": "#808080",
    "green": "#008000",
    "greenyellow": "#ADFF2F",
    "honeydew": "#F0FFF0",
    "hotpink": "#FF69B4",
    "indianred": "#CD5C5C",
    "indigo": "#4B0082",
    "ivory": "#FFFFF0",
    "khaki": "#F0E68C",
    "lavender": "#E6E6FA",
    "lavenderblush": "#FFF0F5",
    "lawngreen": "#7CFC00",
    "lemonchiffon": "#FFFACD",
    "lightblue": "#ADD8E6",
    "lightcoral": "#F08080",
    "lightcyan": "#E0FFFF",
    "lightgoldenrodyellow": "#FAFAD2",
    "lightgray": "#D3D3D3",
    "lightgrey": "#D3D3D3",
    "lightgreen": "#90EE90",
    "lightpink": "#FFB6C1",
    "lightsalmon": "#FFA07A",
    "lightseagreen": "#20B2AA",
    "lightskyblue": "#87CEFA",
    "lightslategray": "#778899",
    "lightslategrey": "#778899",
    "lightsteelblue": "#B0C4DE",
    "lightyellow": "#FFFFE0",
    "lime": "#00FF00",
    "limegreen": "#32CD32",
    "linen": "#FAF0E6",
    "magenta": "#FF00FF",
    "maroon": "#800000",
    "mediumaquamarine": "#66CDAA",
    "mediumblue": "#0000CD",
    "mediumorchid": "#BA55D3",
    "mediumpurple": "#9370DB",
    "mediumseagreen": "#3CB371",
    "mediumslateblue": "#7B68EE",
    "mediumspringgreen": "#00FA9A",
    "mediumturquoise": "#48D1CC",
    "mediumvioletred": "#C71585",
    "midnightblue": "#191970",
    "mintcream": "#F5FFFA",
    "mistyrose": "#FFE4E1",
    "moccasin": "#FFE4B5",
    "navajowhite": "#FFDEAD",
    "navy": "#000080",
    "oldlace": "#FDF5E6",
    "olive": "#808000",
    "olivedrab": "#6B8E23",
    "orange": "#FFA500",
    "orangered": "#FF4500",
    "orchid": "#DA70D6",
    "palegoldenrod": "#EEE8AA",
    "palegreen": "#98FB98",
    "paleturquoise": "#AFEEEE",
    "palevioletred": "#DB7093",
    "papayawhip": "#FFEFD5",
    "peachpuff": "#FFDAB9",
    "peru": "#CD853F",
    "pink": "#FFC0CB",
    "plum": "#DDA0DD",
    "powderblue": "#B0E0E6",
    "purple": "#800080",
    "rebeccapurple": "#663399",
    "red": "#FF0000",
    "rosybrown": "#BC8F8F",
    "royalblue": "#4169E1",
    "saddlebrown": "#8B4513",
    "salmon": "#FA8072",
    "sandybrown": "#F4A460",
    "seagreen": "#2E8B57",
    "seashell": "#FFF5EE",
    "sienna": "#A0522D",
    "silver": "#C0C0C0",
    "skyblue": "#87CEEB",
    "slateblue": "#6A5ACD",
    "slategray": "#708090",
    "slategrey": "#708090",
    "snow": "#FFFAFA",
    "springgreen": "#00FF7F",
    "steelblue": "#4682B4",
    "tan": "#D2B48C",
    "teal": "#008080",
    "thistle": "#D8BFD8",
    "tomato": "#FF6347",
    "turquoise": "#40E0D0",
    "violet": "#EE82EE",
    "wheat": "#F5DEB3",
    "white": "#FFFFFF",
    "whitesmoke": "#F5F5F5",
    "yellow": "#FFFF00",
    "yellowgreen": "#9ACD32"
}