/**
 * /api/server/* — guild / server data.
 *
 * Migration status: STUB
 * Port from: src/routes/api/servers.js
 */

import Elysia, { t } from "elysia";
import { authPlugin } from "@plugins/auth";
import { dbPlugin } from "@plugins/db";

export const serversRoutes = new Elysia({ prefix: "/api/server", tags: ["servers"] })
  .use(authPlugin)
  .use(dbPlugin)

  // GET /api/server/:id
  .get("/:id", async ({ params, requireAuth, db }) => {
    requireAuth();
    return { _stub: true, message: "Not yet ported to Elysia", id: params.id };
  }, {
    params: t.Object({ id: t.String() }),
  });
