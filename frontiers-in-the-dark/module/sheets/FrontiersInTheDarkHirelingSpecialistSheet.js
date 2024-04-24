export default class FrontiersInTheDarkHirelingSpecialistSheet extends ActorSheet {
     static get defaultOptions() {
         return foundry.utils.mergeObject(super.defaultOptions, {
             template: `systems/frontiers-in-the-dark/templates/sheets/hireling-specialist-sheet.html`,
             tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "inventory"}],
         });
     }

    async getData() {
        const data = super.getData();

        data.config = CONFIG.frontiersInTheDark;

        data.equipment = data.items.filter(item => item.type === "equipment");
        data.edges = data.items.filter(item => item.type === "edge");
        data.flaws = data.items.filter(item => item.type === "flaw");
        data.data.system.load = data.equipment.reduce((accumulator, current) => {
            return accumulator + current.system.load
        }, 0);

        return data;
    }

    activateListeners(html) {
        html.find(".item-delete").click(this._onItemDelete.bind(this));
        html.find(".show-item").click(this._onShowItem.bind(this));

        super.activateListeners(html);
    }

    async _onItemDelete(event) {
        const element = $(event.currentTarget).parents(".item");
        await this.actor.deleteEmbeddedDocuments("Item", [element.data("itemId")]);
        element.slideUp(200, () => this.render(false));
    }

    async _onShowItem(event) {
        const element = $(event.currentTarget).parents(".item");
        const item = this.actor.items.get(element.data("itemId"));
        let speaker = ChatMessage.getSpeaker();
        let result = await renderTemplate("systems/frontiers-in-the-dark/templates/chat/itemTemplate.html", {name: item.name, description: item.system.description});

        let messageData = {
            speaker: speaker,
            content: result,
            type: CONST.CHAT_MESSAGE_TYPES.ROLL,
        }
        CONFIG.ChatMessage.documentClass.create(messageData, {})
    }
}
