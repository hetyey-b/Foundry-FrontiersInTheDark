export default class FrontiersInTheDarkItemSheet extends ItemSheet {
    get template() {
        return `systems/frontiers-in-the-dark/templates/sheets/${this.item.type}-sheet.html`;
    }

    async getData(options) {
        const context = await super.getData(options);
        return context;
    }

// _getSubmitData(updateData) {
//        let formData = super._getSubmitData(updateData);
//
//        debugger
//        return formData;
//    }
}
