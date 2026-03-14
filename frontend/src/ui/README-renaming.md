# Renaming "Stardust" / Storybook categories

When you rename **"Stardust PLX"** or the UI library name, only change these. Do **not** change folder names or import paths unless you update every reference.

## Safe to change (display only)

- **Storybook story titles** in `*.stories.ts`: the `title` in `meta` (e.g. `'Stardust UI/Button'`, `'Pollux-Specific Components/Raritybox Button'`) is only for the sidebar. You can rename to anything; no code or imports depend on them. Use **string literals** only – Storybook v10+ does not support dynamic titles (template literals) for indexing.

## Do not change without updating everything

- **Folder name** `stardust-ui`  
  If you rename this folder, you must:
  1. Update **every import** that uses `@/ui/stardust-ui/` or `../stardust-ui/` (views, components, themes).
  2. Update **.storybook/main.ts** – the `stories` glob that contains `stardust-ui` (e.g. `"../src/ui/stardust-ui/**/*.stories.@(js|jsx|mjs|ts|tsx)"`).

## Current layout

| Purpose              | Location / value |
|----------------------|------------------|
| Generic UI components folder | `src/ui/stardust-ui/` |
| Storybook stories glob       | `../src/ui/stardust-ui/**/*.stories.@(...)` in `.storybook/main.ts` |
| Imports from app/views       | `@/ui/stardust-ui/Card/Card.vue` etc. |
| Imports from components      | `@/ui/stardust-ui/CardShowcase/CardShowcase.vue` etc. |
| Story titles (generic)       | `'Stardust UI/...'` in `stardust-ui/**/*.stories.ts` |
| Story titles (Pollux)        | `'Pollux-Specific Components/...'` in `components/**/*.stories.ts` |

**Internal imports** (e.g. LanguageSelect → DropdownSelectPlus) use **relative paths** (`../DropdownSelectPlus/...`) so they keep working if you rename the parent folder.

If "things broke" after renaming: check that (1) the **folder** is still `stardust-ui` (or that every reference was updated), and (2) no import path was accidentally changed by a find-replace that matched "stardust" inside paths.
