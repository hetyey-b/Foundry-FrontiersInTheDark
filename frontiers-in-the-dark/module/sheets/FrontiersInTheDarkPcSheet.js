export default class FrontiersInTheDarkPcSheet extends ActorSheet {
     static get defaultOptions() {
         return foundry.utils.mergeObject(super.defaultOptions, {
             template: `systems/frontiers-in-the-dark/templates/sheets/pc-sheet.html`,
             tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "inventory"}],
         });
     }

    async getData() {
        const data = super.getData();

        data.config = CONFIG.frontiersInTheDark;

        data.data.system.notes = await TextEditor.enrichHTML(data.data.system.notes, {secrets: data.data.owner, async: true});

        data.equipment = data.items.filter(item => item.type === "equipment");
        data.ability = data.items.filter(item => item.type === "ability");
        data.specialistability = data.items.filter(item => item.type === "specialist-ability");

        data.data.system.load = data.equipment.reduce((accumulator, current) => {
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
        html.find(".item-roll").click(this._onItemRoll.bind(this));
        html.find(".show-item").click(this._onShowItem.bind(this));
        html.find(".fortune-roll").click(this._onFortuneRoll.bind(this));

        super.activateListeners(html);
    }

    async _onItemDelete(event) {
        const element = $(event.currentTarget).parents(".item");
        await this.actor.deleteEmbeddedDocuments("Item", [element.data("itemId")]);
        element.slideUp(200, () => this.render(false));
    }

    async _onItemRoll(event) {
        this.rollPopup(event.currentTarget);
    }

    async _onFortuneRoll() {
        this.fortuneRoll();
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

    fortuneRoll() {
        const resultTextFromRoll = {
            1: "1 - Failure",
            2: "2 - Failure",
            3: "3 - Failure",
            4: "4 - Success with a Consequence",
            5: "5 - Success with a Consequence",
            6: "6 - Success",
            "crit": "6,6 - Critical Success",
        };
        let content = `
            <form>
                <label>Dice</label>
                <input name="dice" id="dice" type="text" data-dtype="Number"/>
            </form>
        `;

        new Dialog({
            title: "Roll",
            content: content,
            buttons: {
                yes: {
                    label: "Roll",
                    callback: async (html) => {
                        let speaker = ChatMessage.getSpeaker();
                        let d = parseInt(html.find('[name="dice"]')[0].value);
                        if (d < 0) {
                            d = 0;
                        }
                        let r = new Roll(`${d === 0 ? 2 : d}d6`, {});
                        r.evaluate({async: true});
                        const rolls = (r.terms)[0].results;
                        const rollResults = rolls.map(roll => roll.result).sort((a, b) => b - a);

                        let rollResultText = "";
                        if (d === 0) {
                            rollResultText = resultTextFromRoll[rollResults[1]];
                        } else if (rollResults[0] === 6 && rollResults[1] === 6) {
                            rollResultText = resultTextFromRoll["crit"];
                        } else {
                            rollResultText = resultTextFromRoll[rollResults[0]];
                        }

                        debugger
                        let result = await renderTemplate("systems/frontiers-in-the-dark/templates/chat/fortuneRollTemplate.html", {rolls, rollResultText});

                        let messageData = {
                            speaker: speaker,
                            content: result,
                            type: CONST.CHAT_MESSAGE_TYPES.ROLL,
                            roll: r
                        }
                        CONFIG.ChatMessage.documentClass.create(messageData, {})
                    }
                },
                no: {
                    label: "Close",
                }
            },
            default: "yes",
        }).render(true);
    }

    rollPopup(element) {
        let content = `
            <form>
                <label for="pos">Position:</label>
                <select id="pos" name="pos">
                    <option value="controlled">Controlled</option>
                    <option value="risky" selected>Risky</option>
                    <option value="desperate">Desperate</option>
                </select>
                <hr/>
                <label for="fx">Effect:</label>
                <select id="fx" name="fx">
                    <option value="no effect">No Effect</option>
                    <option value="limited">Limited</option>
                    <option value="standard" selected>Standard</option>
                    <option value="great">Great</option>
                    <option value="extreme">Extreme</option>
                </select>
                <hr/>
                <label>Modifier</label>
                <select id="mod" name="mod">
                    <option value="-3">-3</option>
                    <option value="-2">-2</option>
                    <option value="-1">-1</option>
                    <option value="0" selected>0</option>
                    <option value="+1">+1</option>
                    <option value="+2">+2</option>
                    <option value="+3">+3</option>
                </select>
            </form>
        `;

        new Dialog({
            title: "Roll",
            content: content,
            buttons: {
                yes: {
                    label: "Roll",
                    callback: async (html) => {
                        let modifier = parseInt(html.find('[name="mod"]')[0].value);
                        let position = html.find('[name="pos"]')[0].value;
                        let effect = html.find('[name="fx"]')[0].value;

                        await this.roll(element, modifier, position, effect);
                    }
                },
                no: {
                    label: "Close",
                }
            },
            default: "yes",
        }).render(true);
    }

    async roll(element, modifier, position, effect) {
        const resultTextFromRoll = {
            1: "1 - Failure",
            2: "2 - Failure",
            3: "3 - Failure",
            4: "4 - Success with a Consequence",
            5: "5 - Success with a Consequence",
            6: "6 - Success",
            "crit": "6,6 - Critical Success",
        };
        const attribute = element.dataset.rollattribute || false;
        const action = element.dataset.rollaction || false;
        let speaker = ChatMessage.getSpeaker();
        let d = modifier;
        let rollType = "Fortune Roll";

        if (attribute && action) {
            d += this.actor.system.attributes[attribute][action];
            rollType = `Action Roll - ${action}`;
        } else if (attribute) {
            const actions = Object.values(this.actor.system.attributes[attribute]);
            d += actions.reduce((accumulator,current) => {
                return accumulator + (current > 0 ? 1 : 0)
            }, 0);
            rollType = `Resistance Roll - ${attribute}`;
        }

        if (d < 0) {
            d = 0;
        }
        let r = new Roll(`${d === 0 ? 2 : d}d6`, {});
        r.evaluate({async: true});
        const rolls = (r.terms)[0].results;
        const rollResults = rolls.map(roll => roll.result).sort((a, b) => b - a);

        let rollResultText = "";
        if (d === 0) {
            rollResultText = resultTextFromRoll[rollResults[1]];
        } else if (rollResults[0] === 6 && rollResults[1] === 6) {
            rollResultText = resultTextFromRoll["crit"];
        } else {
            rollResultText = resultTextFromRoll[rollResults[0]];
        }

        let result = await renderTemplate("systems/frontiers-in-the-dark/templates/chat/rollTemplate.html", {rolls, rollType, rollResultText, position, effect});

        let messageData = {
            speaker: speaker,
            content: result,
            type: CONST.CHAT_MESSAGE_TYPES.ROLL,
            roll: r
        }
        CONFIG.ChatMessage.documentClass.create(messageData, {})
    }
}
