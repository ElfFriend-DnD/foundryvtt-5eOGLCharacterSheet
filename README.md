# D&D 5e OGL Character Sheet

![Latest Release Download Count](https://img.shields.io/badge/dynamic/json?label=Downloads@latest&query=assets%5B1%5D.download_count&url=https%3A%2F%2Fapi.github.com%2Frepos%2FElfFriend-DnD%2Ffoundryvtt-5eOGLCharacterSheet%2Freleases%2Flatest)

I disliked this layout in Roll20, I dislike it in Foundry, but I acknowledge that it will probably help some people transition.

## Installation

Module JSON:

```
https://github.com/ElfFriend-DnD/foundryvtt-5eOGLCharacterSheet/releases/latest/download/module.json
```

## Gallery


Click to view bigger.

## Key Features & Changes

Absolute trash can layout, now with 100% more foundry compatibiltiy. Seriously why do you like this layout?

## Options

| **Name**                      | Description                                                                                     |
| ----------------------------- | ----------------------------------------------------------------------------------------------- |
| **Limit Actions to Cantrips** | Instead of showing all spells that deal damage in the Attacks panel, limit it to only cantrips. |

This sheet respects the 5e System setting: "Disable Experience Tracking"

### Compatibility

I'm honestly not sure how well this will play with modules that affect character sheets, I'll try to test as many as possible but if somethign is obviously breaking please create and issue here and I'll see what I can do.

| **Name**                                                                                         | Works | Notes                     |
| ------------------------------------------------------------------------------------------------ | :---: | ------------------------- |
| [Better Rolls 5e](https://github.com/RedReign/FoundryVTT-BetterRolls5e)                          |  :x:  | haven't even tried it yet |
| [Midi-QOL](https://gitlab.com/tposney/midi-qol)                                                  |  :x:  | haven't even tried it yet |
| [Minor QOL](https://gitlab.com/tposney/minor-qol)                                                |  :x:  | haven't even tried it yet |
| [5e-Sheet Resources Plus](https://github.com/ardittristan/5eSheet-resourcesPlus)                 |  :x:  | haven't even tried it yet |
| [Variant Encumbrance](https://github.com/VanirDev/VariantEncumbrance)                            |  :x:  | haven't even tried it yet |
| [FoundryVTT Magic Items](https://gitlab.com/riccisi/foundryvtt-magic-items)                      |  :x:  | haven't even tried it yet |
| [D&D5e Dark Mode](https://github.com/Stryxin/dnd5edark-foundryvtt)                               |  :x:  | haven't even tried it yet |
| [Favourite Item Tab](https://github.com/syl3r86/favtab)                                          |  :x:  | haven't even tried it yet |
| [Inventory+](https://github.com/syl3r86/inventory-plus)                                          |  :x:  | haven't even tried it yet |
| [Illandril's Character Sheet Lockdown](https://github.com/illandril/FoundryVTT-sheet5e-lockdown) |  :x:  | haven't even tried it yet |
| [Crash's 5e Downtime Tracking](https://github.com/crash1115/5e-training)                         |  :x:  | haven't even tried it yet |

## Known Issues

- The To Hit/Save DC column is probably going to respond poorly to unconventional weapon builds. Stuff like the Hexblade or Bladesinger.

## Acknowledgements

Obviously almost all of the layout decisions here are pretty directly ripped from the Roll20 OGL Character Sheet, and by proxy the WOTC official 5e Sheet.

Yoinked some expanded Biography tab code directly from [tidy5e-sheet](https://github.com/sdenec/tidy5e-sheet). Also took their localization of the headers in said tab.

Bootstrapped with Nick East's [create-foundry-project](https://gitlab.com/foundry-projects/foundry-pc/create-foundry-project).

Mad props to the [League of Extraordinary FoundryVTT Developers](https://forums.forge-vtt.com/c/package-development/11) community which helped me figure out a lot.
