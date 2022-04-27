import { MODULE_ID } from './constants';

export function log(force: boolean, ...args) {
  //@ts-ignore
  const shouldLog = force || game.modules.get('_dev-mode')?.api?.getPackageDebugValue(MODULE_ID);

  if (shouldLog) {
    console.log(MODULE_ID, '|', ...args);
  }
}
