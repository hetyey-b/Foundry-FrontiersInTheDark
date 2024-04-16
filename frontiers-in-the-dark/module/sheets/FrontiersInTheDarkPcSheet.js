export default class FrontiersInTheDarkPcSheet extends ActorSheet {
     static get defaultOptions() {
         return foundry.utils.mergeObject(super.defaultOptions, {
             template: `systems/frontiers-in-the-dark/templates/sheets/pc-sheet.html`,
             tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "inventory"}],
         });
     }

    getData() {
        const data = super.getData();

        data.config = CONFIG.frontiersInTheDark;

        data.data.system.load = data.data.items.reduce((accumulator, current) => {
            return accumulator + current.system.load
        }, 0);
        data.data.system.loadText = "Fast";
        if (data.data.system.load > 4) {
            data.data.system.loadText = "Regular";
        }
        if (data.data.system.load > 6) {
            data.data.system.loadText = "Slow";
        }
        if (data.data.system.load > 8) {
            data.data.system.loadText = "Too heavy to move";
        }


        data.data.system.attributes.perception.value =
            (data.data.system.attributes.perception.hunt > 0 ? 1 : 0) +
            (data.data.system.attributes.perception.research > 0 ? 1 : 0) +
            (data.data.system.attributes.perception.rig  > 0 ? 1 : 0) +
            (data.data.system.attributes.perception.scout > 0 ? 1 : 0);

        data.data.system.attributes.physical.value =
            (data.data.system.attributes.physical.finesse > 0 ? 1 : 0) +
            (data.data.system.attributes.physical.manoeuvre > 0 ? 1 : 0)  +
            (data.data.system.attributes.physical.skirmish > 0 ? 1 : 0) +
            (data.data.system.attributes.physical.wreck > 0 ? 1 : 0);

        data.data.system.attributes.mental.value =
            (data.data.system.attributes.mental.attune > 0 ? 1 : 0) +
            (data.data.system.attributes.mental.command > 0 ? 1 : 0) +
            (data.data.system.attributes.mental.consort > 0 ? 1 : 0) +
            (data.data.system.attributes.mental.deceive > 0 ? 1 : 0);

        return data;
    }

    activateListeners(html) {
        html.find(".item-delete").click(this._onItemDelete.bind(this));

        super.activateListeners(html);
    }

    async _onItemDelete(event) {
        const element = $(event.currentTarget).parents(".item");
        await this.actor.deleteEmbeddedDocuments("Item", [element.data("itemId")]);
        element.slideUp(200, () => this.render(false));
    }
}
