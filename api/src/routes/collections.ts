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

const RARITY_IDX = ["C", "U", "R", "SR", "UR", "XR"] as const;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

async function stickerCount(pack: any, DB: any) {
  const [pdata, mdata] = await Promise.all([
    DB.cosmetics.find({ series_id: pack.icon }, { name: 1, id: 1, rarity: 1 }).lean(),
    DB.items.find({ id: { $in: pack?.materials?.map((x: any) => x.id ?? x) ?? [] } }, { name: 1, id: 1, rarity: 1 }).lean(),
  ]);
  pack.size          = pdata.length;
  pack.materialsData = mdata;
  pack.content       = pdata;
  return pack;
}

function isExact(pot: any[], recipe: any[]): boolean {
  if (pot.length !== recipe.length) return false;
  return recipe.every((item: any) => {
    const mat = pot.find((m: any) => m.id === (item.id ?? item));
    if (!mat) return false;
    return mat.count >= (item.count ?? 1);
  });
}

// ---------------------------------------------------------------------------
// Route definitions
// ---------------------------------------------------------------------------

export const collectionsRoutes = new Elysia({ tags: ["collections"] })
  .use(authPlugin)
  .use(dbPlugin)

  // GET /items/:endpoint  (search or single item by id)
  .get("/items/:endpoint", async ({ params, query, db }) => {
    const DB = db as any;
    const endpoint = params.endpoint;

    if (endpoint === "all") {
      return DB.items.find({}, { _id: 0, __v: 0, emoji: 0 }).lean();
    }

    if (endpoint === "search") {
      const ALLOWED = ["_id", "id", "rarity", "code", "type", "crafted", "open"] as const;
      const queries: Record<string, unknown> = {};
      for (const k of ALLOWED) {
        const v = (query as Record<string, string | undefined>)[k];
        if (v !== undefined) queries[k] = v;
      }
      if (!(query as any).all) {
        queries.display = true;
        queries.crafted = !!(query as any).craftables;
      }

      const result: any[] = await DB.items
        .find(queries, { emoji: 0, usefile: 0, altEmoji: 0 })
        .skip(parseInt((query as any).skip ?? "0") || 0)
        .limit(parseInt((query as any).lim ?? "50") || 50)
        .sort({ _id: -1 })
        .lean();

      result.forEach((x: any) => {
        const ts = x._id.toString().substring(0, 8);
        x.release = parseInt(ts, 16) * 1000;
      });
      await Promise.all(result.map((r: any) => r.type === "boosterpack" ? stickerCount(r, DB) : null));
      return result;
    }

    // Single item lookup by id
    return DB.items.findOne({ id: endpoint }, { _id: 0, __v: 0, emoji: 0 }).lean();
  }, {
    params: t.Object({ endpoint: t.String() }),
    query:  t.Object({
      id:         t.Optional(t.String()),
      rarity:     t.Optional(t.String()),
      code:       t.Optional(t.String()),
      type:       t.Optional(t.String()),
      crafted:    t.Optional(t.String()),
      open:       t.Optional(t.String()),
      all:        t.Optional(t.String()),
      craftables: t.Optional(t.String()),
      skip:       t.Optional(t.String()),
      lim:        t.Optional(t.String()),
    }),
  })

  // GET /api/crafting/:endpoint  — alias
  .get("/crafting/:endpoint", async ({ params, query, db }) => {
    const DB = db as any;
    return DB.items.findOne({ id: params.endpoint }, { _id: 0, __v: 0, emoji: 0 }).lean();
  }, {
    params: t.Object({ endpoint: t.String() }),
    query:  t.Object({ skip: t.Optional(t.String()), lim: t.Optional(t.String()) }),
  })

  // POST /api/crafting/mix — crafting discovery
  .post("/crafting/mix", async ({ body, apiUser, db, set }) => {
    const DB  = db as any;
    const pot: any[] = body.pot;

    if (!pot?.length) { set.status = 400; return { error: "No Pot" }; }

    let craftingHistory: string[] = [];
    if (apiUser?.id) {
      const userData = await DB.users.get(apiUser.id, { "modules.inventory": 1 });
      craftingHistory = (userData?.modules?.inventory ?? [])
        .filter((x: any) => x.crafted > 0)
        .map((i: any) => i.id);
    }

    const potTypeMap = pot.map((i: any) => i.type);

    const queryExact = {
      $or: [
        { materials: { $size: pot.length, $all: pot.map((i: any) => i.id) } },
        {
          $and: pot.map((itm: any) => ({
            "materials.id": itm.id,
            "materials.count": { $lte: itm.count },
          })).concat([{ materials: { $size: pot.length } }]),
        },
      ],
      crafted: true,
    };
    const queryBroad = {
      $or: [
        { materials: { $all: pot.map((i: any) => i.id) } },
        { "materials.id": { $all: pot.map((i: any) => i.id) } },
      ],
      crafted: true,
    };

    let possible: any[] = await DB.items.find(queryExact).lean().exec();
    const isExactMatch = possible.length > 0;

    if (!isExactMatch) possible = await DB.items.find(queryBroad).lean().exec();

    if (!possible.length) {
      // type-craft fallback
      const refinedPot = pot.map((item: any) => ({
        ...item,
        count: item.count * ((RARITY_IDX.indexOf(item.rarity) + 1) / 2),
      }));
      const querySameType = {
        $and: pot.map((itm: any) => {
          const threshold = refinedPot
            .filter((i: any) => i.type === itm.type)
            .reduce((a: any, b: any) => ({ count: a.count + b.count }))?.count ?? 0;
          return { "typeCraft.count": { $lte: threshold }, "typeCraft.type": itm.type };
        }).concat([{ "typeCraft.type": { $all: potTypeMap } }]),
        crafted: true,
      };

      possible = await DB.items.find(querySameType).lean().exec();

      const potSorted  = [...pot].sort((a: any, b: any) => RARITY_IDX.indexOf(b.rarity) - RARITY_IDX.indexOf(a.rarity));
      const highestRar = potSorted[0]?.rarity as typeof RARITY_IDX[number];
      const lowestRar  = potSorted[pot.length - 1]?.rarity as typeof RARITY_IDX[number];

      possible = possible.filter((x: any) => {
        const rI = RARITY_IDX.indexOf(x.rarity);
        return rI >= (RARITY_IDX.indexOf(lowestRar) || 1) && rI <= RARITY_IDX.indexOf(highestRar);
      });

      if (possible.length) {
        possible = [shuffle(possible)[0]!];
        return { discovery: possible[0], isDiscovery: !craftingHistory.includes(possible[0].id), canCraftNow: true, typeCraft: true };
      }

      // last resort — any item with matching types
      possible = await DB.items.find({ "typeCraft.type": { $all: potTypeMap } }).lean().exec();
      if (!possible.length) return { possible: 0, noMoreTable: true };

      const fallback = shuffle(possible)[0]!;
      return { discovery: fallback, isDiscovery: !craftingHistory.includes(fallback.id), canCraftNow: false, typeCraft: true, notQuite: true };
    }

    // Prefer the most exact match if multiple
    if (isExactMatch && possible.length > 1) {
      possible = [possible.sort((a: any, b: any) => {
        const aFits = a.materials.every((x: any) => x.count <= pot.find((y: any) => y.id === x.id)?.count);
        if (aFits) return -1;
        return RARITY_IDX.indexOf(a.rarity) - RARITY_IDX.indexOf(b.rarity);
      })[0]!];
    }

    const discovery   = possible[0];
    const canCraftNow = isExact(pot, discovery.materials);
    const isDiscovery = !craftingHistory.includes(discovery.id);
    return { discovery, isDiscovery, canCraftNow };
  }, {
    body: t.Object({
      pot: t.Array(t.Object({ id: t.String(), count: t.Number(), type: t.Optional(t.String()), rarity: t.Optional(t.String()) })),
    }),
  })

  // POST /api/crafting/create  (alias: /craft) — execute a craft
  .post("/crafting/create", async ({ body, apiUser, requireAuth, db, set }) => {
    requireAuth();
    const DB = db as any;
    const { pot, item } = body as { pot?: any[]; item: string };

    const itemToCraft = await DB.items.get({ id: item });
    if (!itemToCraft?.crafted) { set.status = 403; return { status: "ERROR", message: "This item can't be crafted" }; }

    const userData = await DB.users.getFull(apiUser.id);
    if (!userData) { set.status = 401; return { status: "ERROR", message: "Not Logged in" }; }

    const materials = pot ?? itemToCraft.materials;
    for (const itm of materials) {
      const has = userData.modules.inventory.find((i: any) => i.id === itm.id);
      if (!has || has.count < itm.count) {
        set.status = 403;
        return { status: "ERROR", message: `You don't have enough of [${itm.id}]` };
      }
    }

    await Promise.all(materials.map((m: any) => userData.removeItem(m.id, m.count)));
    await Promise.all([
      userData.addItem(item, 1, true),
      DB.users.set(apiUser.id, {
        $inc: { "progression.craftingExp": { C:1, U:2, R:5, SR:10, UR:25, XR:50 }[itemToCraft.rarity as string] ?? 1 },
      }),
    ]);

    return { status: "OK", message: "Item has been crafted", inventory: userData.modules.inventory };
  }, {
    body: t.Object({
      item: t.String(),
      pot:  t.Optional(t.Array(t.Object({ id: t.String(), count: t.Number() }))),
    }),
  })

  // Alias: /craft
  .post("/crafting/craft", async ({ body, apiUser, requireAuth, db, set }) => {
    requireAuth();
    const DB = db as any;
    const { pot, item } = body as { pot?: any[]; item: string };

    const itemToCraft = await DB.items.get({ id: item });
    if (!itemToCraft?.crafted) { set.status = 403; return { status: "ERROR", message: "This item can't be crafted" }; }

    const userData = await DB.users.getFull(apiUser.id);
    if (!userData) { set.status = 401; return { status: "ERROR", message: "Not Logged in" }; }

    const materials = pot ?? itemToCraft.materials;
    for (const itm of materials) {
      const has = userData.modules.inventory.find((i: any) => i.id === itm.id);
      if (!has || has.count < itm.count) {
        set.status = 403;
        return { status: "ERROR", message: `You don't have enough of [${itm.id}]` };
      }
    }

    await Promise.all(materials.map((m: any) => userData.removeItem(m.id, m.count)));
    await Promise.all([
      userData.addItem(item, 1, true),
      DB.users.set(apiUser.id, {
        $inc: { "progression.craftingExp": { C:1, U:2, R:5, SR:10, UR:25, XR:50 }[itemToCraft.rarity as string] ?? 1 },
      }),
    ]);

    return { status: "OK", message: "Item has been crafted", inventory: userData.modules.inventory };
  }, {
    body: t.Object({
      item: t.String(),
      pot:  t.Optional(t.Array(t.Object({ id: t.String(), count: t.Number() }))),
    }),
  });
