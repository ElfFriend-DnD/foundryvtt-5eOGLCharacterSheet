import { log, getActivationType, getWeaponRelevantAbility } from './helpers';
import { registerSettings } from './module/settings.js';
import { preloadTemplates } from './module/preloadTemplates.js';
import { MODULE_ID, MySettings } from './constants.js';
//@ts-ignore
import { DND5E } from '../../systems/dnd5e/module/config.js';
//@ts-ignore
import ActorSheet5e from '../../systems/dnd5e/module/actor/sheets/base.js';
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
    if (!game.user.isGM && this.actor.limited) {
      // FIXME TS
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
  activateListeners(html) {
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

    // within each activation time, we want to display: Items which do damange, Spells which do damage, Features
    // MUTATED
    const actionsData: Record<string, Set<Item5e>> = {
      action: new Set(),
      bonus: new Set(),
      reaction: new Set(),
      special: new Set(),
    };

    try {
      // digest all weapons equipped populate the actionsData appropriate categories
      const weapons = sheetData?.inventory.find(({ label }) => label.includes('Weapon'))?.items; // brittle?

      const equippedWeapons = weapons.filter(({ data }) => data.equipped) || [];

      // MUTATES actionsData
      equippedWeapons.forEach((item) => {
        const attackBonus = item.data?.attackBonus;
        // FIXME this has to be set by the user, perhaps we can infer from the `actor.traits.weaponProf`
        const prof = item.data?.proficient ? sheetData.data.attributes.prof : 0;

        const actionType = item.data?.actionType;
        const actionTypeBonus = Number(sheetData.data.bonuses?.[actionType]?.attack || 0);

        const relevantAbility = getWeaponRelevantAbility(item.data, sheetData.data);
        const relevantAbilityMod = sheetData.data.abilities[relevantAbility]?.mod;

        const toHit = actionTypeBonus + relevantAbilityMod + attackBonus + prof;

        const activationType = getActivationType(item.data?.activation?.type);

        actionsData[activationType].add({
          ...item,
          labels: {
            ...item.labels,
            toHit: String(toHit),
          },
        });
      });

      // Setting - Show icon on inventory list
      if (game.settings.get(MODULE_ID, MySettings.showIconsOnInventoryList)) {
        sheetData.settingsShowInventoryIcons = true;
      } else {
        sheetData.settingsShowInventoryIcons = false;
      }
    } catch (e) {
      log(true, 'error trying to digest inventory', e);
    }

    try {
      // digest all prepared spells and populate the actionsData appropriate categories
      // MUTATES actionsData
      sheetData?.spellbook.forEach(({ spells, label }) => {
        // if the user only wants cantrips here, no nothing if the label does not include "Cantrip"
        if (game.settings.get(MODULE_ID, MySettings.limitActionsToCantrips)) {
          // brittle
          if (!label.includes('Cantrip')) {
            return;
          }
        }

        const preparedSpells = spells.filter(({ data }) => {
          if (data?.preparation?.mode === 'always') {
            return true;
          }
          return data?.preparation?.prepared;
        });

        const reactions = preparedSpells.filter(({ data }) => {
          return data?.activation?.type === 'reaction';
        });

        const damageDealers = preparedSpells.filter(({ data }) => {
          //ASSUMPTION: If the spell causes damage, it will have damageParts
          return data?.damage?.parts?.length > 0;
        });

        new Set([...damageDealers, ...reactions]).forEach((spell) => {
          const actionType = spell.data?.actionType;

          const actionTypeBonus = String(sheetData.data.bonuses?.[actionType]?.attack || 0);
          const spellcastingMod = sheetData.data.abilities[sheetData.data.attributes.spellcasting]?.mod;
          const prof = sheetData.data.attributes.prof;

          const toHitLabel = String(Number(actionTypeBonus) + spellcastingMod + prof);

          const activationType = getActivationType(spell.data?.activation?.type);

          actionsData[activationType].add({
            ...spell,
            labels: {
              ...spell.labels,
              toHit: toHitLabel,
            },
          });
        });
      });
    } catch (e) {
      log(true, 'error trying to digest spellbook', e);
    }

    sheetData.actionsData = actionsData;

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
      if (!!sheetData.data.details.description.value && !sheetData.data.details.appearance) {
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

/* ------------------------------------ */
/* Setup module							*/
/* ------------------------------------ */
// Hooks.once('setup', function () {
//   // Do anything after initialization but before
//   // ready
// });

// Register OGL5eCharacterSheet Sheet
Actors.registerSheet('dnd5e', OGL5eCharacterSheet, {
  types: ['character'],
  makeDefault: false,
});

/* ------------------------------------ */
/* When ready							*/
/* ------------------------------------ */
// Hooks.once('ready', function () {
// });
