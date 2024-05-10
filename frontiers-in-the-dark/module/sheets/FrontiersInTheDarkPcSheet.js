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
        data.concentrating = data.items.filter(item => item.type === "component").sort((a,b) => {
            if (a.system.lvl > b.system.lvl) {
                return 1;
            }
            if (a.system.lvl < b.system.lvl) {
                return -1;
            }
            if (a.name < b.name) {
                return -1;
            }
            if (a.name > b.name) {
                return 1;
            }
            return 0;
        });

        data.concentrating_lvl = data.concentrating.reduce((accumulator, current) => {
            return accumulator + current.system.lvl
        }, 0);
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
        html.find(".cast-spell").click(this._onCastSpell.bind(this));

        super.activateListeners(html);
    }

    async _onCastSpell() {
        var concentrating = this.actor.items._source.filter(item => item.type === "component");
        var concentrating_lvl = concentrating.reduce((accumulator, current) => {
            return accumulator + current.system.lvl
        }, 0);

        if (concentrating_lvl <= 0) {
            return;
        }
        
        const ranges = [ 
            "Touch: anything you are touching",
            "Reach: anything within 5 meters",
            "Near: anything within 10 meters",
            "Far: anything in the same room",
            "Sight: anything you can see",
        ];
        const durations = [
            "Instant: the spell only lasts a moment, tho it's effects remain. This is typically what's used for combat spells.",
            "Momentary: the spell's effect lasts for 10 seconds",
            "Minutes: the spell's effect lasts 10 minutes",
            "Hour: the spell's effect lasts 1 hour",
            "Day: the spell's effect lasts 1 day",
        ];
        const areas = [
            "Tiny: affects a small item, something that would only be 1 Load to carry",
            "Individual: affects a single distinct creature or one object of similar size to a person",
            "Group: 5 creatures close together",
            "Room: affects an entire Small Room",
            "Endless: the spell can go on for up to 100 meters in diameter",
        ];
        let content = `
            <form>
                <h1>Level: ${concentrating_lvl}</h1>
                <hr/>
                <label for="method">Method:</label>
                <select id="method" name="method">
                    <option value="evocation" selected>Evocation</option>
                    <option value="enchantment">Enchantment</option>
                    <option value="conjuration">Conjuration</option>
                    <option value="other">Other (from playbook)</option>
                </select>
                <hr/>
                <label for="range">Range:</label>
                <select id="range" name="range">
                    <option value="0" selected>(0) ${ranges[0]}</option>
                    <option value="1">(1) ${ranges[1]}</option>
                    <option value="2">(2) ${ranges[2]}</option>
                    <option value="3">(3) ${ranges[3]}</option>
                    <option value="4">(4) ${ranges[4]}</option>
                </select>
                <hr/>
                <label for="duration">Duration:</label>
                <select id="duration" name="duration">
                    <option value="0" selected>(0) ${durations[0]}</option>
                    <option value="1">(1) ${durations[1]}</option>
                    <option value="2">(2) ${durations[2]}</option>
                    <option value="3">(3) ${durations[3]}</option>
                    <option value="4">(4) ${durations[4]}</option>
                </select>
                <hr/>
                <label for="area">Area:</label>
                <select id="area" name="area">
                    <option value="0" selected>(0) ${areas[0]}</option>
                    <option value="1">(1) ${areas[1]}</option>
                    <option value="2">(2) ${areas[2]}</option>
                    <option value="3">(3) ${areas[3]}</option>
                    <option value="4">(4) ${areas[4]}</option>
                </select>
                <hr/>
                <label for="quirks">Quirks:</label>
                <select id="quirks" name="quirks">
                    <option value="0" selected>0</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                </select>
                <hr/>
                <ul>
                ${
                    concentrating.map(component => `<li>${component.name}</li>`).join('')
                }
                </ul>
            </form>
        `;

        new Dialog({
            title: "Cast Spell",
            content: content,
            buttons: {
                yes: {
                    label: "Cast",
                    callback: async (html) => {
                        let speaker = ChatMessage.getSpeaker();
                        let method = html.find('[name="method"]')[0].value;
                        let range = parseInt(html.find('[name="range"]')[0].value);
                        let duration = parseInt(html.find('[name="duration"]')[0].value);
                        let area = parseInt(html.find('[name="area"]')[0].value);
                        let quirks = parseInt(html.find('[name="quirks"]')[0].value);

                        let result = await renderTemplate("systems/frontiers-in-the-dark/templates/chat/magicTemplate.html", {
                            lvl: concentrating_lvl,
                            components: concentrating,
                            range: ranges[range],
                            duration: durations[duration],
                            area: areas[area],
                            quirks: quirks,
                            lvl_remaining: concentrating_lvl - (range + duration + area + quirks),
                            method: method,
                        });

                        let messageData = {
                            speaker: speaker,
                            content: result,
                            type: CONST.CHAT_MESSAGE_TYPES.ROLL,
                        }
                        CONFIG.ChatMessage.documentClass.create(messageData, {})
                    }
                },
                no: {
                    label: "Cancel"
                }
            }
        }).render(true, {width: 800});
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
