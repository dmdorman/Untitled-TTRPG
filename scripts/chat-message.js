import { UnT } from "./untitled-ttrpg.js";

export class UnTChatMessage extends ChatMessage {
      /* 
        copied and modified from chat-message.js 
        so that border color will change based on value used in constructor
      */
      async getHTML() {
        // const html = await super.getHTML()

        const borderColor = this.getFlag(`${UnT.ID}`, 'borderColor')

        // Determine some metadata
        const data = this.toObject(false);
        data.content = await TextEditor.enrichHTML(this.content, {async: true, rollData: this.getRollData()});
        const isWhisper = this.whisper.length;

        // Construct message data
        const messageData = {
        message: data,
        user: game.user,
        author: this.user,
        alias: this.alias,
        cssClass: [
            this.type === CONST.CHAT_MESSAGE_TYPES.IC ? "ic" : null,
            this.type === CONST.CHAT_MESSAGE_TYPES.EMOTE ? "emote" : null,
            isWhisper ? "whisper" : null,
            this.blind ? "blind": null
        ].filterJoin(" "),
        isWhisper: this.whisper.length,
        canDelete: game.user.isGM,  // Only GM users are allowed to have the trash-bin icon in the chat log itself
        whisperTo: this.whisper.map(u => {
            let user = game.users.get(u);
            return user ? user.name : null;
        }).filterJoin(", ")
        };

        // Render message data specifically for ROLL type messages
        if ( this.isRoll ) {
            await this._renderRollContent(messageData);
        }

        // Define a border color
        if ( this.type === CONST.CHAT_MESSAGE_TYPES.OOC ) {
            messageData.borderColor = this.user?.color;
        } else if (borderColor) {
            messageData.borderColor = borderColor
        }

        // Render the chat message
        let html = await renderTemplate(CONFIG.ChatMessage.template, messageData);
        html = $(html);

        // Flag expanded state of dice rolls
        if ( this._rollExpanded ) html.find(".dice-tooltip").addClass("expanded");

        /**
         * A hook event that fires for each ChatMessage which is rendered for addition to the ChatLog.
         * This hook allows for final customization of the message HTML before it is added to the log.
         * @function renderChatMessage
         * @memberof hookEvents
         * @param {ChatMessage} message   The ChatMessage document being rendered
         * @param {jQuery} html           The pending HTML as a jQuery object
         * @param {object} data           The input data provided for template rendering
         */
        Hooks.call("renderChatMessage", this, html, messageData);
        return html;
    }

    static async create(data, options = {}) {
        if (data.borderColor) {
            data.flags = data.flags || {};
            data.flags[`${UnT.ID}`] = data.flags[`${UnT.ID}`] || {};
            data.flags[`${UnT.ID}`].borderColor = data.borderColor;      
        }

        return super.create(data, options)
    }
}
