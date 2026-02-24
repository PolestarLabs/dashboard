/**
 * controllers/collections/items.ts — /items/* route handlers.
 * Moved from services/collections/items.ts.
 */

import Elysia, { t } from "elysia";
import { dbPlugin } from "@plugins/db";
import { shuffle, stickerCount } from "@routes/helpers";
import { ItemsEndpointParams, ItemsSearchQuery } from "@routes/schemas";

export const itemsRoutes = new Elysia()
  .use(dbPlugin)
  .get("/items/:endpoint", async ({ params, query, db }) => {
    const DB = db as any;
    const endpoint = params.endpoint;

    if (endpoint === "all") {
      return DB.items.find({}, { _id: 0, __v: 0, emoji: 0 }).lean();
    }

    if (endpoint === "search") {
      const ALLOWED = [
        "_id",
        "id",
        "rarity",
        "code",
        "type",
        "crafted",
        "open",
      ] as const;
      const queries: Record<string, unknown> = {};
      for (const k of ALLOWED) {
        const v = (query as Record<string, string | undefined>)[k];
        if (v !== undefined) queries[k] = v;
      }
      if (!(query as any).all) {
        queries.display  = true;
        queries.crafted  = !!(query as any).craftables;
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

      await Promise.all(
        result.map((r: any) =>
          r.type === "boosterpack" ? stickerCount(r, DB) : null,
        ),
      );
      return result;
    }

    // Single item lookup by id
    return DB.items
      .findOne({ id: endpoint }, { _id: 0, __v: 0, emoji: 0 })
      .lean();
  }, {
    params: ItemsEndpointParams,
    query:  ItemsSearchQuery,
  });
