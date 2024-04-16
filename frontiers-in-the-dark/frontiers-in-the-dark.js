import { frontiersInTheDark } from "./module/config.js";
import FrontiersInTheDarkItemSheet from "./module/sheets/FrontiersInTheDarkItemSheet.js";
import FrontiersInTheDarkPcSheet from "./module/sheets/FrontiersInTheDarkPcSheet.js";

Hooks.once("init", function() {
    console.log("fitd | Initialising Frontiers in the Dark system");

    CONFIG.frontiersInTheDark = frontiersInTheDark;

    Items.unregisterSheet("core",ItemSheet);
    Items.registerSheet("frontiers-in-the-dark", FrontiersInTheDarkItemSheet, {makeDefault: true});

    Actors.unregisterSheet("core",ActorSheet);
    Actors.registerSheet("frontiers-in-the-dark", FrontiersInTheDarkPcSheet, {makeDefault: true});
})
