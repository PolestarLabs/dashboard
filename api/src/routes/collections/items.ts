/**
 * controllers/collections/items.ts — /items/* route handlers.
 * Moved from services/collections/items.ts.
 */

import Elysia from "elysia";
import { dbPlugin } from "@plugins/db";
import { ItemsEndpointParams, ItemsSearchQuery } from "@routes/_schemas";
import { getAllItems, searchItems, getItemById } from "@services/items";

export const itemsRoutes = new Elysia()
  .use(dbPlugin)
  .get("/items/:endpoint", async ({ params, query, db }) => {
    const DB = db as any;
    const endpoint = params.endpoint;

    if (endpoint === "all")    return getAllItems(DB);
    if (endpoint === "search") return searchItems(query as Record<string, string | undefined>, DB);
    return getItemById(endpoint, DB);
  }, {
    params: ItemsEndpointParams,
    query:  ItemsSearchQuery,
  });
