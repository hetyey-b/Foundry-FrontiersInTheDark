import { frontiersInTheDark } from "./module/config.js";
import FrontiersInTheDarkItemSheet from "./module/sheets/FrontiersInTheDarkItemSheet.js";
import FrontiersInTheDarkPcSheet from "./module/sheets/FrontiersInTheDarkPcSheet.js";
import FrontiersInTheDarkAnimalSheet from "./module/sheets/FrontiersInTheDarkAnimalSheet.js";
import FrontiersInTheDarkGuildSheet from "./module/sheets/FrontiersInTheDarkGuildSheet.js";
import FrontiersInTheDarkHirelingGroupSheet from "./module/sheets/FrontiersInTheDarkHirelingGroupSheet.js";
import FrontiersInTheDarkHirelingSpecialistSheet from "./module/sheets/FrontiersInTheDarkHirelingSpecialistSheet.js";

Hooks.once("init", function() {
    console.log("fitd | Initialising Frontiers in the Dark system");

    CONFIG.frontiersInTheDark = frontiersInTheDark;

    Items.unregisterSheet("core",ItemSheet);
    Items.registerSheet("frontiers-in-the-dark", FrontiersInTheDarkItemSheet, {makeDefault: true});

    Actors.unregisterSheet("core",ActorSheet);
    Actors.registerSheet("frontiers-in-the-dark", FrontiersInTheDarkPcSheet, {types: ["pc"],makeDefault: true});
    Actors.registerSheet("frontiers-in-the-dark", FrontiersInTheDarkAnimalSheet, {types: ["animal"],makeDefault: true});
    Actors.registerSheet("frontiers-in-the-dark", FrontiersInTheDarkGuildSheet, {types: ["guild"],makeDefault: true});
    Actors.registerSheet("frontiers-in-the-dark", FrontiersInTheDarkHirelingGroupSheet, {types: ["hireling-group"],makeDefault: true});
    Actors.registerSheet("frontiers-in-the-dark", FrontiersInTheDarkHirelingSpecialistSheet, {types: ["hireling-specialist"],makeDefault: true});
})
