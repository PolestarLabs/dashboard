/**
 * /api/crafting/* and /api/items/* — crafting / item collections.
 *
 * Migration status: STUB
 * Port from: src/routes/api/collections.js
 */

import Elysia from "elysia";
import { authPlugin } from "@plugins/auth";
import { dbPlugin } from "@plugins/db";

export const collectionsRoutes = new Elysia({ tags: ["collections"] })
  .use(authPlugin)
  .use(dbPlugin)

  .all("/api/crafting/*", async () => ({ _stub: true, message: "Not yet ported to Elysia" }))
  .all("/api/items/*",    async () => ({ _stub: true, message: "Not yet ported to Elysia" }));
