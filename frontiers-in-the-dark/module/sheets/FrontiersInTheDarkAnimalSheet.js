export default class FrontiersInTheDarkAnimalSheet extends ActorSheet {
     static get defaultOptions() {
         return foundry.utils.mergeObject(super.defaultOptions, {
             template: `systems/frontiers-in-the-dark/templates/sheets/animal-sheet.html`,
             tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "inventory"}],
         });
     }

    async getData() {
        const data = super.getData();

        data.config = CONFIG.frontiersInTheDark;
        return data;
    }
}
