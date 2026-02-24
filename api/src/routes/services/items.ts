/**
 * services/items.ts — Item collection query logic.
 * Extracted from controllers/collections/items.ts so the controller stays thin.
 */

import { shuffle } from "utils/shuffle";
import { stickerCount } from "utils/cosmetics";

const SEARCH_ALLOWED = ["_id", "id", "rarity", "code", "type", "crafted", "open"] as const;

export async function getAllItems(DB: any) {
  return DB.items.find({}, { _id: 0, __v: 0, emoji: 0 }).lean();
}

export async function searchItems(query: Record<string, string | undefined>, DB: any) {
  const queries: Record<string, unknown> = {};
  for (const k of SEARCH_ALLOWED) {
    const v = query[k];
    if (v !== undefined) queries[k] = v;
  }
  if (!query.all) {
    queries.display = true;
    queries.crafted = !!query.craftables;
  }

  const result: any[] = await DB.items
    .find(queries, { emoji: 0, usefile: 0, altEmoji: 0 })
    .skip(parseInt(query.skip ?? "0") || 0)
    .limit(parseInt(query.lim ?? "50") || 50)
    .sort({ _id: -1 })
    .lean();

  result.forEach((x: any) => {
    const ts = x._id.toString().substring(0, 8);
    x.release = parseInt(ts, 16) * 1000;
  });

  await Promise.all(
    result.map((r: any) => (r.type === "boosterpack" ? stickerCount(r, DB) : null)),
  );

  return result;
}

export async function getItemById(id: string, DB: any) {
  return DB.items.findOne({ id }, { _id: 0, __v: 0, emoji: 0 }).lean();
}
