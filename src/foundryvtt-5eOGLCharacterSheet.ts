import { log } from './helpers';
import { registerSettings } from './module/settings.js';
import { preloadTemplates } from './module/preloadTemplates.js';
import { MODULE_ID, MySettings } from './constants.js';
//@ts-ignore
import ActorSheet5eCharacter from '../../systems/dnd5e/module/actor/sheets/character.js';

Handlebars.registerHelper('ogl5e-sheet-path', (relativePath: string) => {
  return `modules/${MODULE_ID}/${relativePath}`;
});

Handlebars.registerHelper('ogl5e-sheet-safeVal', (value, fallback) => {
  return new Handlebars.SafeString(value || fallback);
});

Handlebars.registerHelper('ogl5e-sheet-add', (value: number, toAdd: number) => {
  return new Handlebars.SafeString(String(value + toAdd));
});

Handlebars.registerHelper('ogl5e-sheet-isEmpty', (input: Object | Array<any> | Set<any>) => {
  if (!input) {
    return true;
  }
  if (input instanceof Array) {
    return input.length < 1;
  }
  if (input instanceof Set) {
    return input.size < 1;
  }
  return isObjectEmpty(input);
});

export class OGL5eCharacterSheet extends ActorSheet5eCharacter {
  get template() {
    //@ts-ignore
    if (!game.user.isGM && this.actor.limited && !game.settings.get(MODULE_ID, MySettings.expandedLimited)) {
      return `modules/${MODULE_ID}/templates/character-sheet-ltd.hbs`;
    }

    return `modules/${MODULE_ID}/templates/character-sheet.hbs`;
  }

  static get defaultOptions(): FormApplicationOptions {
    const options = super.defaultOptions;

    mergeObject(options, {
      classes: ['dnd5e', 'sheet', 'actor', 'character', 'ogl5e-sheet'],
      height: 680,
      width: 830,
    });

    return options;
  }

  /**
   * Inject character actions list before listeners are activated
   * @override
   */
  async _renderInner(...args) {
    const html = await super._renderInner(...args);

    try {
      const actionsTab = html.find('.actions');

      //@ts-ignore
      const actionsTabHtml = $(await CAL5E.renderActionsList(this.actor));
      actionsTab.html(actionsTabHtml);
    } catch (e) {
      log(true, e);
    }

    return html;
  }

  /**
   * Handle rolling an Ability check, either a test or a saving throw
   * @param {Event} event   The originating click event
   * @private
   */
  _onRollAbilitySave(event) {
    event.preventDefault();
    let ability = event.currentTarget.parentElement.dataset.ability;

    //@ts-ignore
    this.actor.rollAbilitySave(ability, { event: event }); // FIXME TS
  }

  /**
   * Change the quantity of an Owned Item within the Actor
   * @param {Event} event   The triggering click event
   * @private
   */
  async _onQuantityChange(event) {
    event.preventDefault();
    const itemId = event.currentTarget.closest('.item').dataset.itemId;
    // @ts-ignore
    const item = this.actor.getOwnedItem(itemId);
    const quantity = parseInt(event.target.value);
    event.target.value = quantity;
    return item.update({ 'data.quantity': quantity });
  }

  /**
   * Activate event listeners using the prepared sheet HTML
   * @param html {HTML}   The prepared HTML object ready to be rendered into the DOM
   */
  async activateListeners(html) {
    super.activateListeners(html);
    //@ts-ignore
    if (!this.options.editable) return; // FIXME TS

    // Saving Throws
    html.find('.saving-throw-name').click(this._onRollAbilitySave.bind(this));

    // Item Quantity
    html
      .find('.item-quantity input')
      .click((ev) => ev.target.select())
      .change(this._onQuantityChange.bind(this));
  }

  getData() {
    const sheetData = super.getData();

    // replace classLabels with Subclass + Class list
    try {
      let items = sheetData.items;
      const classList = items
        .filter((item) => item.type === 'class')
        .map((item) => {
          return `${item.data.subclass} ${item.name} ${item.data.levels}`;
        });

      sheetData.classLabels = classList.join(', ');
    } catch (e) {
      log(true, 'error trying to parse class list', e);
    }

    // add abbreviated spell activation labels
    try {
      // MUTATES sheetData
      sheetData?.spellbook.forEach(({ spells }) => {
        spells.forEach((spell) => {
          const newActivationLabel = spell.labels.activation
            .split(' ')
            .map((string: string, index) => {
              // ASSUMPTION: First "part" of the split string is the number
              if (index === 0) {
                return string;
              }
              // ASSUMPTION: Everything after that we can safely abbreviate to be just the first character
              return string.substr(0, 1);
            })
            .join(' ');

          spell.labels.activationAbbrev = newActivationLabel;
        });
      });
    } catch (e) {
      log(true, 'error trying to modify activation labels', e);
    }

    // add abbreviated feature activation labels
    try {
      let activeFeaturesIndex = sheetData.features.findIndex(({ label }) => label.includes('Active'));

      // MUTATES sheetData
      sheetData.features[activeFeaturesIndex].items.forEach((item) => {
        const newActivationLabel = item.labels.activation
          .split(' ')
          .map((string: string, index) => {
            // ASSUMPTION: First "part" of the split string is the number
            if (index === 0) {
              return string;
            }
            // ASSUMPTION: Everything after that we can safely abbreviate to be just the first character
            return string.substr(0, 1);
          })
          .join(' ');

        item.labels.activationAbbrev = newActivationLabel;
      });
    } catch (e) {
      log(true, 'error trying to modify activation labels', e);
    }

    // if description is populated and appearance isn't use description as appearance
    try {
      log(false, sheetData);
      if (!!sheetData.data.details.description?.value && !sheetData.data.details.appearance) {
        sheetData.data.details.appearance = sheetData.data.details.description.value;
      }
    } catch (e) {
      log(true, 'error trying to migrate description to appearance', e);
    }

    return sheetData;
  }
}

/* ------------------------------------ */
/* Initialize module					*/
/* ------------------------------------ */
Hooks.once('init', async function () {
  log(true, `Initializing ${MODULE_ID}`);

  // Register custom module settings
  registerSettings();

  // Preload Handlebars templates
  await preloadTemplates();
});

// Register OGL5eCharacterSheet Sheet
Actors.registerSheet('dnd5e', OGL5eCharacterSheet, {
  label: 'OGL Character Sheet',
  types: ['character'],
  makeDefault: false,
});
