/**
 * controllers/collections/items.ts — /items/* route handlers.
 */

import Elysia from "elysia";
import { getAllItems, searchItems, getItemById } from "@services/items";

export const itemsRoutes = new Elysia()
  .get("/items/:endpoint", async ({ params, query }) => {
    const endpoint = params.endpoint;

    if (endpoint === "all")    return getAllItems();
    if (endpoint === "search") return searchItems(query as Record<string, string | undefined>);
    return getItemById(endpoint);
  });
