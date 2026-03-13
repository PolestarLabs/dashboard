/**
 * services/users.ts — User profile business logic, decoupled from Elysia.
 * Commends → services/commends.ts
 * Galleries → services/galleries.ts
 * Fanart hearts → services/fanart.ts
 */

import { db } from "@plugins/db";
import { getDiscordUser, type DiscordUser } from "utils/discord";
import { buildSearchQuery } from "utils/search";

/** Matches UserMetaUpdate from @polestarlabs/database_schema; use that import once the schema package is updated. */
interface UserMetaUpdate {
  id: string;
  username?: string;
  global_name?: string | null;
  discriminator?: string;
  tag?: string;
  avatar?: string | null;
  displayAvatarURL?: string | null;
}

// ── Response building ────────────────────────────────────────────────────────

export function parseUserdata(discordUser: DiscordUser, USR: Record<string, any> | null, STATUS: number, cosmetics?: Record<string, any> | null) {
  const dbTag = typeof USR?.tag === "string" && USR.tag ? USR.tag : null;
  const dbAvatar = typeof USR?.avatar === "string" && USR.avatar ? USR.avatar : null;
  const discordAvatar = discordUser.avatarURL ?? null;
  const avatarDiffers = dbAvatar !== discordAvatar && discordAvatar != null;
  const avatar = avatarDiffers ? discordAvatar : (dbAvatar ?? discordAvatar);

  const response: Record<string, unknown> = {
    id:     discordUser.id,
    tag:    dbTag ?? (discordUser.id ? discordUser.username : null),
    avatar,
  };

  if (!USR) {
    STATUS = !discordUser ? 404 : 206;
    response.isPolluxUser = false;
    response.isBot        = discordUser.bot;
  } else {
    response.isPolluxUser = true;
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
      background: USR.profile.background,
      sticker:    USR.profile.sticker,
      color:      USR.profile.color,
      flair:      USR.profile.flair,
      about:      USR.profile.about,
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

export async function parseUserAndReturn(uID: string, _db = db) {
  const [discordUser, USR, cosmetics] = await Promise.all([
    getDiscordUser(uID),
    _db.users.get(uID),
    _db.userInventory.get(uID),
  ]);

  if (USR && !discordUser.error && discordUser.avatarURL) {
    const dbAvatar = typeof USR.avatar === "string" ? USR.avatar : null;
    if (dbAvatar !== discordUser.avatarURL) {
      const payload: UserMetaUpdate = {
        id: discordUser.id,
        username: discordUser.username,
        displayAvatarURL: discordUser.avatarURL,
      };
      if (discordUser.discriminator != null) payload.discriminator = discordUser.discriminator;
      await (_db.users as unknown as { updateMeta: (u: UserMetaUpdate) => Promise<void> }).updateMeta(payload);
    }
  }

  let STATUS = 200;
  const { response, STATUS: s } = parseUserdata(discordUser, USR, STATUS, cosmetics);
  return { status: s, body: response };
}

// ── Search ───────────────────────────────────────────────────────────────────

const SEARCH_ALLOWED = ["_id", "id", "prime.tier", "name", "tag", "meta.tag", "personalhandle"];

export async function searchUsers(query: Record<string, string | undefined>, _db = db, _redis?: any) {
  const queries = buildSearchQuery(query, SEARCH_ALLOWED);
  if (queries.donator === "exists") queries.donator = { $exists: true };

  // execute the query and return plain objects so we can map over them
  const results: any[] = await _db.users.find(queries)
    .skip(parseInt(query.skip ?? "0", 10) || 0)
    .limit(parseInt(query.lim ?? "50", 10) || 50)
    .sort({ _id: -1 })
    .lean();

  const parsed = await Promise.all(results.map(async (USR: any) => {
    const [discordUser, cosmetics] = await Promise.all([
      getDiscordUser(USR.id),
      _db.userInventory.get(USR.id),
    ]);
    if (!discordUser) return null;
    const { response } = parseUserdata(discordUser, USR, 200, cosmetics);
    return response;
  }));

  return parsed.filter(Boolean);
}

// ── Inventory / Stickers / Medals / Backgrounds ──────────────────────────────

export async function getUserInventory(userId: string, _db = db) {
  const userWithInventory = await (_db.userInventory as any)
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

export async function getUserStickers(userId: string, _db = db) {
  const USR = await _db.userInventory.get(userId);
  if (!USR) return null;
  const stickerIds: string[] = USR.stickerInventory.filter(Boolean);
  const stickerMeta: any[] = await _db.cosmetics.find({ id: { $in: stickerIds } }).lean();
  const packs: any[] = await _db.items.find({ icon: { $in: stickerMeta.map((x: any) => x?.series_id) } }).lean();
  stickerMeta.forEach((x: any) => { x.packData = packs.find((p: any) => p.icon === x.series_id); });
  return stickerMeta;
}

export async function getUserMedals(userId: string, _db = db) {
  const USR = await _db.userInventory.get(userId);
  if (!USR) return null;
  const ids: string[] = USR.medalInventory.filter(Boolean);
  // call lean() first so we can chain noCache if available
  return _db.cosmetics.find({ icon: { $in: ids } }).lean().noCache();
}

export async function getUserBackgrounds(userId: string, _db = db) {
  const USR = await _db.userInventory.get(userId);
  if (!USR) return null;
  const codes: string[] = USR.bgInventory.filter(Boolean);
  return _db.cosmetics.find({ code: { $in: codes } }).lean();
}

// ── Commends ─────────────────────────────────────────────────────────────────
// Moved to services/commends.ts
// ── Fanart Hearts ─────────────────────────────────────────────────────────────
// Moved to services/fanart.ts
// ── Galleries ────────────────────────────────────────────────────────────────
// Moved to services/galleries.ts

