/**
 * utils/crafting.ts — crafting‑related utility functions.
 *
 * Initially part of helpers.ts; split out so other modules can import
 * just the crafting helpers without pulling in all of helpers.
 */

/**
 * Returns true when every item in `recipe` is satisfied by the corresponding
 * item in `pot` (same id, count >= required).
 */
export function isExact(pot: any[], recipe: any[]): boolean {
  if (pot.length !== recipe.length) return false;
  return recipe.every((item: any) => {
    const mat = pot.find((m: any) => m.id === (item.id ?? item));
    if (!mat) return false;
    return mat.count >= (item.count ?? 1);
  });
}
