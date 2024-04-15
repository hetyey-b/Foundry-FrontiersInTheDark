import FrontiersInTheDarkItemSheet from "./module/sheets/FrontiersInTheDarkItemSheet.js";

Hooks.once("init", function() {
    console.log("fitd | Initialising Frontiers in the Dark system");

    Items.unregisterSheet("core",ItemSheet);
    Items.registerSheet("frontiers-in-the-dark", FrontiersInTheDarkItemSheet, {makeDefault: true});

    return preloadHandlebarsTemplates();
})
