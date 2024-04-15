export default class FrontiersInTheDarkItemSheet extends ItemSheet {
    get template() {
        return `systems/frontiers-in-the-dark/templates/sheets/${this.item.data.type}-sheet.html`;
    }
}
