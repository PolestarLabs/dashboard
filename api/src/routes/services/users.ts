/**
 * services/users.ts — User business logic, decoupled from Elysia.
 */

import { getDiscordUser, getManyDiscordUsers, type DiscordUser } from "@helpers/discord";

type DB = Record<string, any>;

// ── Response building ────────────────────────────────────────────────────────

export function parseUserdata(discordUser: DiscordUser, USR: Record<string, any> | null, STATUS: number) {
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
    response.level     = USR.modules.level;
    response.exp       = USR.modules.exp;
    response.commends  = USR.modules.commend;
    response.RBN       = USR.modules.RBN;
    response.JDE       = USR.modules.JDE;
    response.SPH       = USR.modules.SPH;
    response.isDonator = USR.donator && USR.donator !== "";
    response.donatorTier = USR.donator;
    response.isBlacklisted = !!USR.blacklisted && USR.blacklisted !== "";
    response.profile   = {
      background: USR.modules.bgID,
      sticker:    USR.modules.sticker,
      color:      USR.modules.favcolor,
      flair:      USR.modules.flairTop,
      about:      USR.modules.persotext,
      tagline:    USR.modules.tagline,
      medals:     USR.modules.medals,
    };
    response.inventorySize = USR.modules.inventory?.reduce((a: number, b: { count: number }) => a + b.count, 0) ?? 0;
  }

  if (discordUser.error) {
    STATUS = response.isPolluxUser ? 206 : 400;
    response.discordDataUnavailable = discordUser.error;
  }

  return { response, STATUS };
}

export async function parseUserAndReturn(uID: string, db: DB, redis: any) {
  const [discordUser, USR] = await Promise.all([
    getDiscordUser(uID, redis),
    db.users.get(uID),
  ]);

  let STATUS = 200;
  const { response, STATUS: s } = parseUserdata(discordUser, USR, STATUS);
  return { status: s, body: response };
}

// ── Search ───────────────────────────────────────────────────────────────────

const SEARCH_ALLOWED = ["_id", "id", "donator", "name", "meta.tag", "personalhandle"];

export async function searchUsers(query: Record<string, string | undefined>, db: DB, redis: any) {
  const queries: Record<string, unknown> = {};
  for (const k of SEARCH_ALLOWED) {
    const v = query[k === "_id" ? "_id" : k];
    if (v !== undefined) queries[k] = v;
  }
  if (queries.donator === "exists") queries.donator = { $exists: true };

  const results: any[] = await db.users.find(queries)
    .skip(parseInt(query.skip ?? "0", 10) || 0)
    .limit(parseInt(query.lim ?? "50", 10) || 50)
    .sort({ _id: -1 })
    .lean();

  const parsed = await Promise.all(results.map(async (USR: any) => {
    const discordUser = await getDiscordUser(USR.id, redis);
    if (!discordUser) return null;
    const { response } = parseUserdata(discordUser, USR, 200);
    return response;
  }));

  return parsed.filter(Boolean);
}

// ── Inventory / Stickers / Medals / Backgrounds ──────────────────────────────

export async function getUserInventory(userId: string, db: DB) {
  const USR = await db.users.get(userId);
  if (!USR) return null;
  const userInventory: any[] = USR.modules.inventory.filter((i: any) => i.count > 0 && typeof i.id === "string");
  const meta: any[] = await db.items.find({ id: { $in: userInventory.map((i: any) => i.id) } });
  userInventory.forEach((item: any) => { item.meta = meta.find((m: any) => m.id === item.id); });
  return userInventory;
}

export async function getUserStickers(userId: string, db: DB) {
  const USR = await db.users.get(userId);
  if (!USR) return null;
  const stickerIds: string[] = USR.modules.stickerInventory.filter(Boolean);
  const stickerMeta: any[] = await db.cosmetics.find({ id: { $in: stickerIds } }).lean();
  const packs: any[] = await db.items.find({ icon: { $in: stickerMeta.map((x: any) => x?.series_id) } }).lean();
  stickerMeta.forEach((x: any) => { x.packData = packs.find((p: any) => p.icon === x.series_id); });
  return stickerMeta;
}

export async function getUserMedals(userId: string, db: DB) {
  const USR = await db.users.get(userId);
  if (!USR) return null;
  const ids: string[] = USR.modules.medalInventory.filter(Boolean);
  return db.cosmetics.find({ icon: { $in: ids } }).lean().noCache();
}

export async function getUserBackgrounds(userId: string, db: DB) {
  const USR = await db.users.get(userId);
  if (!USR) return null;
  const codes: string[] = USR.modules.bgInventory.filter(Boolean);
  return db.cosmetics.find({ code: { $in: codes } }).lean();
}

// ── Commends ─────────────────────────────────────────────────────────────────

export async function getCommendsSimple(userId: string, db: DB) {
  return db.commends.parseFull(userId);
}

export async function getCommendsFull(userId: string, db: DB, redis: any) {
  const userCommends = await db.commends.parseFull(userId, { _id: 0, __v: 0 });
  if (!userCommends) return null;

  const usersInSet = [...new Set([
    ...userCommends.whoIn.map((u: any) => u.id).slice(0, 10),
    ...userCommends.whoOut.map((u: any) => u.id).slice(0, 10),
  ])] as string[];

  const userData = await getManyDiscordUsers(usersInSet, redis);
  const whoIn  = userCommends.whoIn.sort((a: any, b: any) => b.count - a.count) || [];
  const whoOut = userCommends.whoOut.sort((a: any, b: any) => b.count - a.count) || [];
  const totalIn  = userCommends.totalIn  || 0;
  const totalOut = userCommends.totalOut || 0;
  const average    = Math.floor(totalIn / whoIn.length) || 0;
  const normalized = Math.floor((totalIn * whoIn.length) / (totalIn / average)) || 0;

  return { userData, whoIn, whoOut, totalIn, totalOut, average, normalized };
}

export async function getCommendRank(userId: string, endpoint: string, db: DB) {
  const count = (await db.commends.get(userId))?.whoIn?.reduce((a: any, b: any) => ({ count: a.count + b.count }))?.count;
  const ranks: any[] = await db.commends.aggregate([
    { $addFields: { countIn: { $sum: "$whoIn.count" }, countOut: { $sum: "$whoOut.count" } } },
    { $match: { [endpoint === "in" ? "countIn" : "countOut"]: { $gt: count } } },
    { $project: { id: 1, whoOut: 1, whoIn: 1, pplIn: { $size: "$whoIn" }, pplOut: { $size: "$whoOut" } } },
    { $count: "count" },
  ]);
  return { rank: ranks[0]?.count, count };
}

// ── Fanart Hearts ────────────────────────────────────────────────────────────

export async function toggleFanartHeart(
  userId: string,
  fanartId: string,
  operation: "add" | "remove",
  db: DB,
): Promise<{ ok: boolean; status: number; message: string }> {
  const fana = await db.collections.fanart.findOne({ id: fanartId });
  if (!fana) return { ok: false, status: 404, message: "Not Found" };

  if (operation === "add") {
    await Promise.all([
      db.users.set(userId, { $addToSet: { "counters.hearts": fanartId } }),
      db.collections.fanart.updateOne({ id: fanartId }, { $inc: { hearts: 1 } }),
    ]);
  } else {
    await Promise.all([
      db.users.set(userId, { $pull: { "counters.hearts": fanartId } }),
      db.collections.fanart.updateOne({ id: fanartId }, { $inc: { hearts: -1 } }),
    ]);
  }
  return { ok: true, status: 200, message: "OK" };
}

// ── Galleries ────────────────────────────────────────────────────────────────

export async function getGallerySaves(userId: string, db: DB) {
  const [gallery, user] = await Promise.all([
    db.usercols.get(userId),
    db.users.get(userId, { switches: 1 }),
  ]);
  if (user?.switches?.booruPublic === false) return { loading: true, status: "PRIVATE" };
  return gallery?.collections.boorusave ?? [];
}

export async function getGalleryFanart(userId: string, viewerId: string | undefined, db: DB) {
  const query: Record<string, unknown> = { author_ID: userId };
  if (viewerId !== userId) query.publish = true;

  const gallery: any[] = await db.fanart.find(query).lean();
  return gallery.map((item: any) => ({
    title:       item.title,
    description: item.description,
    author:      item.author_ID,
    author_url:  item.artistlink,
    likes:       item.hearts || 0,
    url:         item.src,
    thumb:       item.src.replace("artwork/", "artwork/thumbs/"),
    status:      item.publish ? "published" : item.publish === false ? "denied" : "pending",
  }));
}
