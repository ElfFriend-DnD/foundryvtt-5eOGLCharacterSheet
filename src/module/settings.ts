import { MySettings, MODULE_ID } from '../constants';

export const registerSettings = function () {
  // Register any custom module settings here
  game.settings.register(MODULE_ID, MySettings.showIconsOnInventoryList, {
    name: 'OGL5E.showIconsOnInventoryList',
    default: false,
    type: Boolean,
    scope: 'client',
    config: true,
    hint: 'OGL5E.showIconsOnInventoryListHint',
  });

  game.settings.register(MODULE_ID, MySettings.expandedLimited, {
    name: 'OGL5E.expandedLimited',
    default: false,
    type: Boolean,
    scope: 'world',
    config: true,
    hint: 'OGL5E.expandedLimitedHint',
  });
};
