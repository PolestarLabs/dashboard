/**
 * /api/user/* — user profiles, inventory, handle lookup.
 *
 * Port from: src/routes/api/users.js
 */

import Elysia, { t } from "elysia";
import { authPlugin } from "@plugins/auth";
import { redisPlugin } from "@plugins/redis";
import { dbPlugin } from "@plugins/db";
import { getDiscordUser, getManyDiscordUsers, type DiscordUser } from "@helpers/discord";

// ---------------------------------------------------------------------------
// Shared utilities
// ---------------------------------------------------------------------------

type DB = Record<string, any>;

function parseUserdata(discordUser: DiscordUser, USR: Record<string, any> | null, STATUS: number) {
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

async function parseUserAndReturn(uID: string, db: DB, redis: any) {
  const [discordUser, USR] = await Promise.all([
    getDiscordUser(uID, redis),
    db.users.get(uID),
  ]);

  let STATUS = 200;
  const { response, STATUS: s } = parseUserdata(discordUser, USR, STATUS);
  return { status: s, body: response };
}

// ---------------------------------------------------------------------------
// Route definitions
// ---------------------------------------------------------------------------

export const usersRoutes = new Elysia({ prefix: "/api/user", tags: ["users"] })
  .use(authPlugin)
  .use(redisPlugin)
  .use(dbPlugin)

  // GET /api/user/search?id=&name=…
  .get("/search", async ({ query, db, redis }) => {
    const DB = db as DB;
    const allowed = ["_id", "id", "donator", "name", "meta.tag", "personalhandle"];
    const queries: Record<string, unknown> = {};
    for (const k of allowed) {
      const v = (query as Record<string, string | undefined>)[k === "_id" ? "_id" : k];
      if (v !== undefined) queries[k] = v;
    }
    if (queries.donator === "exists") queries.donator = { $exists: true };

    const results: any[] = await DB.users.find(queries)
      .skip(parseInt((query as any).skip ?? "0", 10) || 0)
      .limit(parseInt((query as any).lim ?? "50", 10) || 50)
      .sort({ _id: -1 })
      .lean();

    const parsed = await Promise.all(results.map(async (USR: any) => {
      const discordUser = await getDiscordUser(USR.id, redis);
      if (!discordUser) return null;
      const { response } = parseUserdata(discordUser, USR, 200);
      return response;
    }));

    return parsed.filter(Boolean);
  }, {
    query: t.Object({
      id:             t.Optional(t.String()),
      name:           t.Optional(t.String()),
      donator:        t.Optional(t.String()),
      personalhandle: t.Optional(t.String()),
      skip:           t.Optional(t.String()),
      lim:            t.Optional(t.String()),
    }),
  })

  // GET /api/user/check_handle?handle=
  .get("/check_handle", async ({ query, db }) => {
    const DB = db as DB;
    if (!query.handle) return { available: false };
    const exists = await DB.users.get({ personalhandle: query.handle });
    return { available: !exists, handle: query.handle };
  }, {
    query: t.Object({ handle: t.Optional(t.String()) }),
  })

  // GET /api/user/:id/inventory
  .get("/:id/inventory", async ({ params, db }) => {
    const DB = db as DB;
    const USR = await DB.users.get(params.id);
    if (!USR) return new Response("Not Found", { status: 404 });
    const userInventory: any[] = USR.modules.inventory.filter((i: any) => i.count > 0 && typeof i.id === "string");
    const meta: any[] = await DB.items.find({ id: { $in: userInventory.map((i: any) => i.id) } });
    userInventory.forEach((item: any) => { item.meta = meta.find((m: any) => m.id === item.id); });
    return userInventory;
  }, {
    params: t.Object({ id: t.String() }),
  })

  // GET /api/user/:id/stickers
  .get("/:id/stickers", async ({ params, db }) => {
    const DB = db as DB;
    const USR = await DB.users.get(params.id);
    if (!USR) return new Response("Not Found", { status: 404 });
    const stickerIds: string[] = USR.modules.stickerInventory.filter(Boolean);
    const stickerMeta: any[] = await DB.cosmetics.find({ id: { $in: stickerIds } }).lean();
    const packs: any[] = await DB.items.find({ icon: { $in: stickerMeta.map((x: any) => x?.series_id) } }).lean();
    stickerMeta.forEach((x: any) => { x.packData = packs.find((p: any) => p.icon === x.series_id); });
    return stickerMeta;
  }, {
    params: t.Object({ id: t.String() }),
  })

  // GET /api/user/:id/medals
  .get("/:id/medals", async ({ params, db }) => {
    const DB = db as DB;
    const USR = await DB.users.get(params.id);
    if (!USR) return new Response("Not Found", { status: 404 });
    const ids: string[] = USR.modules.medalInventory.filter(Boolean);
    return DB.cosmetics.find({ icon: { $in: ids } }).lean().noCache();
  }, {
    params: t.Object({ id: t.String() }),
  })

  // GET /api/user/:id/bgs  (alias: /backgrounds)
  .get("/:id/bgs", async ({ params, db }) => {
    const DB = db as DB;
    const USR = await DB.users.get(params.id);
    if (!USR) return new Response("Not Found", { status: 404 });
    const codes: string[] = USR.modules.bgInventory.filter(Boolean);
    return DB.cosmetics.find({ code: { $in: codes } }).lean();
  }, { params: t.Object({ id: t.String() }) })

  .get("/:id/backgrounds", async ({ params, db }) => {
    const DB = db as DB;
    const USR = await DB.users.get(params.id);
    if (!USR) return new Response("Not Found", { status: 404 });
    const codes: string[] = USR.modules.bgInventory.filter(Boolean);
    return DB.cosmetics.find({ code: { $in: codes } }).lean();
  }, { params: t.Object({ id: t.String() }) })

  // GET /api/user/:id/commends
  .get("/:id/commends", async ({ params, query, db, redis }) => {
    const DB = db as DB;
    const uID = params.id;
    if (!query.full) return DB.commends.parseFull(uID);

    const userCommends = await DB.commends.parseFull(uID, { _id: 0, __v: 0 });
    if (!userCommends) return new Response(null, { status: 404 });

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
  }, {
    params: t.Object({ id: t.String() }),
    query:  t.Object({ full: t.Optional(t.String()) }),
  })

  // GET /api/user/:id/commends/:endpoint
  .get("/:id/commends/:endpoint", async ({ params, db }) => {
    const DB = db as DB;
    const count = (await DB.commends.get(params.id))?.whoIn?.reduce((a: any, b: any) => ({ count: a.count + b.count }))?.count;
    const ranks: any[] = await DB.commends.aggregate([
      { $addFields: { countIn: { $sum: "$whoIn.count" }, countOut: { $sum: "$whoOut.count" } } },
      { $match: { [params.endpoint === "in" ? "countIn" : "countOut"]: { $gt: count } } },
      { $project: { id: 1, whoOut: 1, whoIn: 1, pplIn: { $size: "$whoIn" }, pplOut: { $size: "$whoOut" } } },
      { $count: "count" },
    ]);
    return { rank: ranks[0]?.count, count };
  }, {
    params: t.Object({ id: t.String(), endpoint: t.String() }),
  })

  // POST /api/user/fanart-hearts/:operation/:id
  .post("/fanart-hearts/:operation/:id", async ({ params, apiUser, requireAuth, db, set }) => {
    requireAuth();
    const DB = db as DB;
    const fana = await DB.collections.fanart.findOne({ id: params.id });
    if (!fana) { set.status = 404; return "Not Found"; }

    if (params.operation === "add") {
      await Promise.all([
        DB.users.set(apiUser.id, { $addToSet: { "counters.hearts": params.id } }),
        DB.collections.fanart.updateOne({ id: params.id }, { $inc: { hearts: 1 } }),
      ]);
    } else {
      await Promise.all([
        DB.users.set(apiUser.id, { $pull: { "counters.hearts": params.id } }),
        DB.collections.fanart.updateOne({ id: params.id }, { $inc: { hearts: -1 } }),
      ]);
    }
    set.status = 200;
    return "OK";
  }, {
    params: t.Object({ operation: t.Union([t.Literal("add"), t.Literal("remove")]), id: t.String() }),
  })

  // GET /api/user/:id/galleries/saves
  .get("/:id/galleries/saves", async ({ params, db }) => {
    const DB = db as DB;
    const [gallery, user] = await Promise.all([
      DB.usercols.get(params.id),
      DB.users.get(params.id, { switches: 1 }),
    ]);
    if (user?.switches?.booruPublic === false) return { loading: true, status: "PRIVATE" };
    return gallery?.collections.boorusave ?? [];
  }, {
    params: t.Object({ id: t.String() }),
  })

  // GET /api/user/:id/galleries/fanart
  .get("/:id/galleries/fanart", async ({ params, apiUser, db }) => {
    const DB = db as DB;
    const query: Record<string, unknown> = { author_ID: params.id };
    if (apiUser?.id !== params.id) query.publish = true;

    const gallery: any[] = await DB.fanart.find(query).lean();
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
  }, {
    params: t.Object({ id: t.String() }),
  })

  // GET /api/user/:id  (must come after sub-resource routes)
  .get("/:id", async ({ params, apiUser, db, redis, set }) => {
    const DB = db as DB;
    const uID = params.id === "@me"
      ? (apiUser?.id ?? null)
      : params.id;

    if (!uID) { set.status = 401; return { message: "Authentication required for @me" }; }
    const { status, body } = await parseUserAndReturn(uID, DB, redis);
    set.status = status;
    return body;
  }, {
    params: t.Object({ id: t.String() }),
  });

  .use(authPlugin)
  .use(redisPlugin)
  .use(dbPlugin)

  // GET /api/user/search?id=&name=…
  .get("/search", async ({ query, db, redis }) => {
    // TODO: full port from users.js - search by query params
    return { _stub: true, message: "Not yet ported to Elysia", query };
  }, {
    query: t.Object({
      id:             t.Optional(t.String()),
      name:           t.Optional(t.String()),
      donator:        t.Optional(t.String()),
      personalhandle: t.Optional(t.String()),
      skip:           t.Optional(t.String()),
      lim:            t.Optional(t.String()),
    }),
  })

  // GET /api/user/check_handle?handle=
  .get("/check_handle", async ({ query, db }) => {
    return { _stub: true, message: "Not yet ported to Elysia", query };
  }, {
    query: t.Object({ handle: t.Optional(t.String()) }),
  })

  // GET /api/user/@me  or  /api/user/:id
  .get("/:id", async ({ params, apiUser, db, redis }) => {
    return { _stub: true, message: "Not yet ported to Elysia", id: params.id };
  }, {
    params: t.Object({ id: t.String() }),
  })

  // GET /api/user/:id/inventory
  .get("/:id/inventory", async ({ params, db }) => {
    return { _stub: true, message: "Not yet ported to Elysia", id: params.id };
  }, {
    params: t.Object({ id: t.String() }),
  });
