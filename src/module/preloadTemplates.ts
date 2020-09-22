import { MODULE_ID } from '../constants.js';

export const preloadTemplates = async function () {
  const templatePaths = [
    `modules/${MODULE_ID}/assets/armor-class.hbs`,
    `modules/${MODULE_ID}/templates/character-sheet-ltd.hbs`,
    `modules/${MODULE_ID}/templates/character-sheet.hbs`,
    `modules/${MODULE_ID}/templates/parts/actor-actions-list.hbs`,
    `modules/${MODULE_ID}/templates/parts/actor-features.hbs`,
    `modules/${MODULE_ID}/templates/parts/actor-inventory.hbs`,
    `modules/${MODULE_ID}/templates/parts/actor-spellbook.hbs`,
    `modules/${MODULE_ID}/templates/parts/actor-traits.hbs`,
    `modules/${MODULE_ID}/templates/parts/sheet-header.hbs`,
    `modules/${MODULE_ID}/templates/parts/sheet-sidebar.hbs`,
  ];

  return loadTemplates(templatePaths);
};
