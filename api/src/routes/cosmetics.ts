/**
 * /api/cosmetics/* — cosmetic items (backgrounds, medals, stickers, etc.)
 *
 * Port from: src/routes/api/cosmetics.js
 * Note: /backgrounds/:id/:endpoint (canvas palette generation) is NOT ported
 *       here — it will live in the generators service (skia-canvas worker).
 */

import Elysia, { t } from "elysia";
import { dbPlugin } from "@plugins/db";
import { redisPlugin } from "@plugins/redis";
import { Types as MonTypes } from "mongoose";

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

interface CosmeticDoc {
  _id: { toString(): string };
  id: string;
  code?: string;
  icon?: string;
  rarity?: string;
  tags?: string;
  artistName?: string;
  artistLink?: string;
  type?: string;
  GROUP?: unknown;
  BUNDLE?: unknown;
  tradeable?: boolean;
  droppable?: boolean;
  destroyable?: boolean;
  event?: string | false;
  series_id?: string;
  public?: boolean;
}

function cleanup(item: CosmeticDoc | null): Record<string, unknown> | null {
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

function objectIdFromTimestamp(ts: string): InstanceType<typeof MonTypes.ObjectId> {
  const ms = new Date(ts).getTime() || Number(ts);
  const hex = Math.floor(ms / 1000).toString(16).padStart(8, "0");
  return new MonTypes.ObjectId(hex + "0000000000000000");
}

async function stickerCount(pack: any, DB: any) {
  const [pdata, mdata] = await Promise.all([
    DB.cosmetics.find({ series_id: pack.icon }, { name: 1, id: 1, rarity: 1 }).lean(),
    DB.items.find({ id: { $in: pack.materials?.map((x: any) => x.id ?? x) ?? [] } }, { name: 1, id: 1, rarity: 1 }).lean(),
  ]);
  pack.materialsData = mdata;
  pack.size          = pdata.length;
  pack.content       = pdata;
  return pack;
}

// ---------------------------------------------------------------------------
// Route definitions
// ---------------------------------------------------------------------------

export const cosmeticsRoutes = new Elysia({ prefix: "/api/cosmetics", tags: ["cosmetics"] })
  .use(dbPlugin)
  .use(redisPlugin)

  // GET /api/cosmetics/all
  .get("/all", async ({ db }) => {
    const DB = db as any;
    const result: CosmeticDoc[] = await DB.cosmetics.find({}).lean();
    return result.map(cleanup);
  })

  // GET /api/cosmetics/search?id=&rarity=&type=&event=&before=&after=&searchq=&skip=&lim=
  .get("/search", async ({ query, db }) => {
    const DB = db as any;
    const ALLOWED = ["_id", "id", "rarity", "code", "event", "icon", "type", "expires", "filter", "name"] as const;
    const queries: Record<string, unknown> = {};

    for (const k of ALLOWED) {
      const v = (query as Record<string, string | undefined>)[k];
      if (v !== undefined) queries[k] = v;
    }
    if (queries.event === "null") queries.event = null;
    queries.public = (query as any).public !== "0";

    if ((query as any).before) queries._id = { $lt: objectIdFromTimestamp((query as any).before) };
    if ((query as any).after)  queries._id = { $gt: objectIdFromTimestamp((query as any).after) };

    if ((query as any).searchq) {
      const rx = new RegExp(`.*${(query as any).searchq}.*`, "i");
      const base = queries;
      Object.assign(queries, {
        $and: [{ $or: [{ name: rx }, { id: rx }, { tags: rx }, { artistName: rx }] }, base],
      });
    }

    let result: any[] = await DB.cosmetics
      .find(queries, { public: 0, meta: 0 })
      .skip(parseInt((query as any).skip ?? "0") || 0)
      .limit(parseInt((query as any).lim ?? "50") || 50)
      .sort({ _id: -1 })
      .noCache()
      .lean();

    if (result.length && (query as any).type === "sticker") {
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
  }, {
    query: t.Object({
      id:      t.Optional(t.String()),
      rarity:  t.Optional(t.String()),
      code:    t.Optional(t.String()),
      event:   t.Optional(t.String()),
      icon:    t.Optional(t.String()),
      type:    t.Optional(t.String()),
      expires: t.Optional(t.String()),
      filter:  t.Optional(t.String()),
      name:    t.Optional(t.String()),
      before:  t.Optional(t.String()),
      after:   t.Optional(t.String()),
      searchq: t.Optional(t.String()),
      skip:    t.Optional(t.String()),
      lim:     t.Optional(t.String()),
      all:     t.Optional(t.String()),
      public:  t.Optional(t.String()),
    }),
  })

  // PATCH /api/cosmetics/backgrounds/custom  (update custom bg)
  // POST  /api/cosmetics/backgrounds/custom  (upload new custom bg)
  // These delegate to the customBackground form pipeline — kept as stubs
  // until that pipeline is ported to a Bun-compatible image handler.
  .patch("/backgrounds/custom", () => ({ _stub: true, message: "Custom background upload not yet ported (requires skia-canvas worker)" }))
  .post("/backgrounds/custom",  () => ({ _stub: true, message: "Custom background upload not yet ported (requires skia-canvas worker)" }))

  // GET /api/cosmetics/backgrounds/:id
  .get("/backgrounds/:id", async ({ params, db }) => {
    const DB = db as any;
    const q  = params.id;
    const isOid = MonTypes.ObjectId.isValid(q);
    const result = await DB.cosmetics
      .findOne({ type: "background", $or: [isOid ? { _id: q } : { id: q }, { code: q }] }, { public: 0, meta: 0 })
      .lean();
    return cleanup(result);
  }, {
    params: t.Object({ id: t.String() }),
  })

  // GET /api/cosmetics/medals/:id
  .get("/medals/:id", async ({ params, db }) => {
    const DB = db as any;
    const q  = params.id;
    const isOid = MonTypes.ObjectId.isValid(q);
    const result = await DB.cosmetics
      .findOne({ type: "medal", $or: [isOid ? { _id: q } : { id: q }, { icon: q }] }, { public: 0, meta: 0 })
      .lean();
    return cleanup(result);
  }, {
    params: t.Object({ id: t.String() }),
  })

  // GET /api/cosmetics/count/:type?event=&rarity=
  .get("/count/:type", async ({ params, query, db }) => {
    const DB = db as any;
    const searchQuery: Record<string, unknown> = {
      type:   params.type,
      public: true,
      rarity: query.rarity ?? { $ne: "XR" },
      event:  query.event  ?? null,
    };
    const count = await DB.cosmetics.find(searchQuery).noCache().count().catch(() => "???");
    return count;
  }, {
    params: t.Object({ type: t.String() }),
    query:  t.Object({ event: t.Optional(t.String()), rarity: t.Optional(t.String()) }),
  })

  // GET /api/cosmetics/:other/:id  (generic type lookup, e.g. /stickers/id123)
  .get("/:other/:id", async ({ params, db }) => {
    const DB = db as any;
    const q  = params.id;
    const isOid = MonTypes.ObjectId.isValid(q);
    const result = await DB.cosmetics
      .findOne({ type: params.other.slice(0, -1), $or: [isOid ? { _id: q } : { id: q }] }, { public: 0, meta: 0 })
      .lean();
    return cleanup(result);
  }, {
    params: t.Object({ other: t.String(), id: t.String() }),
  });
