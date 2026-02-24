/**
 * /api/server/* — guild / server data.
 * Thin Elysia controller — delegates to services/servers.
 */

import Elysia from "elysia";
import { authPlugin } from "@plugins/auth";
import { dbPlugin } from "@plugins/db";
import { ServerIdParams } from "@routes/schemas";
import { getServerData } from "@routes/services/servers";

export const serversRoutes = new Elysia({ prefix: "/server", tags: ["servers"] })
  .use(authPlugin)
  .use(dbPlugin)

  .get("/:id", async ({ params, requireAuth, db, set }) => {
    requireAuth();
    const result = await getServerData(params.id, db as any);
    if (!result.ok) { set.status = result.status!; return result.message; }
    return result.data;
  }, { params: ServerIdParams });
