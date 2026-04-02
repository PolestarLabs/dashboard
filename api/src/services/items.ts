/**
 * services/items.ts — Item collection query logic.
 * Extracted from controllers/collections/items.ts so the controller stays thin.
 */

import { db } from "@plugins/db";
import { shuffle } from "utils/shuffle";
import { stickerCount } from "utils/cosmetics";
import { buildSearchQuery } from "utils/search";

const SEARCH_ALLOWED = ["_id", "id", "rarity", "code", "type", "crafted", "open"] as const;

export async function getAllItems() {
  return db.items.find({}, { _id: 0, __v: 0, emoji: 0 });
}

export async function searchItems(query: Record<string, string | undefined>) {
  const queries = buildSearchQuery(query, SEARCH_ALLOWED);
  if (!query.all) {
    queries.display = true;
    queries.crafted = !!query.craftables;
  }

  const result: any[] = await db.items
    .find(queries, { emoji: 0, usefile: 0, altEmoji: 0 })
    .skip(parseInt(query.skip ?? "0") || 0)
    .limit(parseInt(query.lim ?? "50") || 50)
    .sort({ _id: -1 });

  result.forEach((x: any) => {
    const ts = x._id.toString().substring(0, 8);
    x.release = parseInt(ts, 16) * 1000;
  });

  await Promise.all(
    result.map((r: any) => (r.type === "boosterpack" ? stickerCount(r) : null)),
  );

  return result;
}

export async function getItemById(id: string) {
  return db.items.findOne({ id }, { _id: 0, __v: 0, emoji: 0 });
}
