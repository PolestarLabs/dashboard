/**
 * /api/crafting/* and /api/items/* — crafting / item collections.
 *
 * Port from: src/routes/api/collections.js
 */

import Elysia, { t } from "elysia";
import { authPlugin } from "@plugins/auth";
import { dbPlugin } from "@plugins/db";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// rarity values are defined centrally so other modules can reuse them
import { RarityType, RARITY_VALUES } from "@definitions/Rarity";
export type Rarity = RarityType;

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

export async function stickerCount(pack: any, DB: any) {
  const [pdata, mdata] = await Promise.all([
    DB.cosmetics.find({ series_id: pack.icon }, { name: 1, id: 1, rarity: 1 }).lean(),
    DB.items.find({ id: { $in: pack?.materials?.map((x: any) => x.id ?? x) ?? [] } }, { name: 1, id: 1, rarity: 1 }).lean(),
  ]);
  pack.size          = pdata.length;
  pack.materialsData = mdata;
  pack.content       = pdata;
  return pack;
}

export function isExact(pot: any[], recipe: any[]): boolean {
  if (pot.length !== recipe.length) return false;
  return recipe.every((item: any) => {
    const mat = pot.find((m: any) => m.id === (item.id ?? item));
    if (!mat) return false;
    return mat.count >= (item.count ?? 1);
  });
}

import { itemsRoutes } from "./items";
import { craftingRoutes } from "./crafting";

export const collectionsBase = new Elysia({ tags: ["collections"] })
  .use(dbPlugin)
  .use(authPlugin)

export type CollectionsApp = typeof collectionsBase;

export const collectionsRoutes = collectionsBase
  .use(itemsRoutes)
  .use(craftingRoutes);
