/**
 * services/cosmetics.ts — Cosmetics business logic, decoupled from Elysia.
 */

import type { CosmeticDoc } from "@routes/types";
import { objectIdFromTimestamp, isValidObjectId, stickerCount } from "@routes/helpers";

// ── Helpers ──────────────────────────────────────────────────────────────────

export function cleanup(item: CosmeticDoc | null): Record<string, unknown> | null {
  if (!item) return null;
  const event = item.event || false;
  const ts = item._id.toString().substring(0, 8);
  return {
    unified_id:  item._id,
    legacy_id:   item.id,
    legacy_code: item.code,
    legacy_icon: item.icon,
    rarity:      item.rarity,
    tags:        item.tags?.split(" "),
    credit: {
      artist_name:   item.artistName,
      artist_url:    item.artistLink,
      artist_avatar: item.artistLink,
    },
    type:        item.type,
    catalog:     item.GROUP,
    bundle_info: item.BUNDLE,
    can_trade:   item.tradeable  || item.droppable  || false,
    can_destroy: item.destroyable || item.droppable || false,
    drops:       item.droppable  || false,
    is_event:    !!event,
    event_id:    event ? event : undefined,
    release:     new Date(parseInt(ts, 16) * 1000),
  };
}

// ── Querying ─────────────────────────────────────────────────────────────────

const SEARCH_ALLOWED = ["_id", "id", "rarity", "code", "event", "icon", "type", "expires", "filter", "name"] as const;

export async function searchCosmetics(query: Record<string, string | undefined>, DB: any) {
  const queries: Record<string, unknown> = {};
  for (const k of SEARCH_ALLOWED) {
    const v = query[k];
    if (v !== undefined) queries[k] = v;
  }
  if (queries.event === "null") queries.event = null;
  queries.public = query.public !== "0";

  if (query.before) queries._id = { $lt: objectIdFromTimestamp(query.before) };
  if (query.after)  queries._id = { $gt: objectIdFromTimestamp(query.after) };

  if (query.searchq) {
    const rx = new RegExp(`.*${query.searchq}.*`, "i");
    const base = queries;
    Object.assign(queries, {
      $and: [{ $or: [{ name: rx }, { id: rx }, { tags: rx }, { artistName: rx }] }, base],
    });
  }

  let result: any[] = await DB.cosmetics
    .find(queries, { public: 0, meta: 0 })
    .skip(parseInt(query.skip ?? "0") || 0)
    .limit(parseInt(query.lim ?? "50") || 50)
    .sort({ _id: -1 })
    .noCache()
    .lean();

  if (result.length && query.type === "sticker") {
    const packs: any[] = await DB.items.find({ icon: { $in: result.map((x: any) => x.series_id) } }).lean();
    await Promise.all(packs.map((p) => stickerCount(p, DB)));
    result.forEach((x: any) => { x.packData = packs.find((p: any) => p.icon === x.series_id); });
  }

  result.forEach((x: any) => {
    if (!x.code) x.code = x.id;
    if (!x.event) x.event = false;
    x.release = parseInt(x._id.toString().substring(0, 8), 16) * 1000;
  });

  return result;
}

export async function findCosmeticById(type: string, idOrCode: string, DB: any) {
  const isOid = isValidObjectId(idOrCode);
  return DB.cosmetics
    .findOne({ type, $or: [isOid ? { _id: idOrCode } : { id: idOrCode }, { code: idOrCode }, { icon: idOrCode }] }, { public: 0, meta: 0 })
    .lean();
}

export async function countCosmetics(type: string, query: { event?: string; rarity?: string }, DB: any) {
  const searchQuery: Record<string, unknown> = {
    type,
    public: true,
    rarity: query.rarity ?? { $ne: "XR" },
    event:  query.event  ?? null,
  };
  return DB.cosmetics.find(searchQuery).noCache().count().catch(() => "???");
}
