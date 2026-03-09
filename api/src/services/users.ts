/**
 * services/users.ts — User profile business logic, decoupled from Elysia.
 * Commends → services/commends.ts
 * Galleries → services/galleries.ts
 * Fanart hearts → services/fanart.ts
 */

import { getDiscordUser, type DiscordUser } from "utils/discord";
import type { DB } from "@routes/types";

// ── Response building ────────────────────────────────────────────────────────

export function parseUserdata(discordUser: DiscordUser, USR: Record<string, any> | null, STATUS: number, cosmetics?: Record<string, any> | null) {
  const response: Record<string, unknown> = {
    id:     discordUser.id,
    tag:    discordUser.id ? discordUser.username : (USR?.meta?.tag ?? null),
    avatar: (discordUser as any).avatarURL ?? null,
  };

  if (!USR) {
    STATUS = !discordUser ? 404 : 206;
    response.isPolluxUser = false;
    response.isBot        = discordUser.bot;
  } else {
    response.level     = USR.progression.level;
    response.exp       = USR.progression.exp;
    response.commends  = USR.counters?.commend;
    response.RBN       = USR.currency.RBN;
    response.JDE       = USR.currency.JDE;
    response.SPH       = USR.currency.SPH;
    response.isDonator = USR.prime?.tier && USR.prime.tier !== "";
    response.donatorTier = USR.prime?.tier;
    response.isBlacklisted = !!USR.blacklisted && USR.blacklisted !== "";
    response.profile   = {
      background: USR.profile.bgID,
      sticker:    USR.profile.sticker,
      color:      USR.profile.favcolor,
      flair:      USR.profile.flairTop,
      about:      USR.profile.persotext,
      tagline:    USR.profile.tagline,
      medals:     USR.profile.medals,
    };
    response.inventorySize = cosmetics?.inventory?.reduce((a: number, b: { count: number }) => a + b.count, 0) ?? 0;
  }

  if (discordUser.error) {
    STATUS = response.isPolluxUser ? 206 : 400;
    response.discordDataUnavailable = discordUser.error;
  }

  return { response, STATUS };
}

export async function parseUserAndReturn(uID: string, db: DB, redis: any) {
  const [discordUser, USR, cosmetics] = await Promise.all([
    getDiscordUser(uID, redis),
    db.users.get(uID),
    db.userInventory.get(uID),
  ]);

  let STATUS = 200;
  const { response, STATUS: s } = parseUserdata(discordUser, USR, STATUS, cosmetics);
  return { status: s, body: response };
}

// ── Search ───────────────────────────────────────────────────────────────────

const SEARCH_ALLOWED = ["_id", "id", "prime.tier", "name", "meta.tag", "personalhandle"];

export async function searchUsers(query: Record<string, string | undefined>, db: DB, redis: any) {
  const queries: Record<string, unknown> = {};
  for (const k of SEARCH_ALLOWED) {
    const v = query[k === "_id" ? "_id" : k];
    if (v !== undefined) queries[k] = v;
  }
  if (queries.donator === "exists") queries.donator = { $exists: true };

  // execute the query and return plain objects so we can map over them
  const results: any[] = await db.users.find(queries)
    .skip(parseInt(query.skip ?? "0", 10) || 0)
    .limit(parseInt(query.lim ?? "50", 10) || 50)
    .sort({ _id: -1 })
    .lean();

  const parsed = await Promise.all(results.map(async (USR: any) => {
    const [discordUser, cosmetics] = await Promise.all([
      getDiscordUser(USR.id, redis),
      db.userInventory.get(USR.id),
    ]);
    if (!discordUser) return null;
    const { response } = parseUserdata(discordUser, USR, 200, cosmetics);
    return response;
  }));

  return parsed.filter(Boolean);
}

// ── Inventory / Stickers / Medals / Backgrounds ──────────────────────────────

export async function getUserInventory(userId: string, db: DB) {
  const userWithInventory = await (db.userInventory as any)
    .findOne({ id: userId })
    .populate({ path: "itemsData", select: "id name rarity type icon code" })
    .lean();
  if (!userWithInventory) return null;
  const userInventory: any[] = (userWithInventory.inventory ?? []).filter((i: any) => i.count > 0 && typeof i.id === "string");
  const itemsData: any[] = userWithInventory.itemsData ?? [];
  userInventory.forEach((item: any) => {
    item.meta = itemsData.find((m: any) => m.id === item.id);
  });
  return userInventory;
}

export async function getUserStickers(userId: string, db: DB) {
  const USR = await db.userInventory.get(userId);
  if (!USR) return null;
  const stickerIds: string[] = USR.stickerInventory.filter(Boolean);
  const stickerMeta: any[] = await db.cosmetics.find({ id: { $in: stickerIds } }).lean();
  const packs: any[] = await db.items.find({ icon: { $in: stickerMeta.map((x: any) => x?.series_id) } }).lean();
  stickerMeta.forEach((x: any) => { x.packData = packs.find((p: any) => p.icon === x.series_id); });
  return stickerMeta;
}

export async function getUserMedals(userId: string, db: DB) {
  const USR = await db.userInventory.get(userId);
  if (!USR) return null;
  const ids: string[] = USR.medalInventory.filter(Boolean);
  // call lean() first so we can chain noCache if available
  return db.cosmetics.find({ icon: { $in: ids } }).lean().noCache();
}

export async function getUserBackgrounds(userId: string, db: DB) {
  const USR = await db.userInventory.get(userId);
  if (!USR) return null;
  const codes: string[] = USR.bgInventory.filter(Boolean);
  return db.cosmetics.find({ code: { $in: codes } }).lean();
}

// ── Commends ─────────────────────────────────────────────────────────────────
// Moved to services/commends.ts
// ── Fanart Hearts ─────────────────────────────────────────────────────────────
// Moved to services/fanart.ts
// ── Galleries ────────────────────────────────────────────────────────────────
// Moved to services/galleries.ts

