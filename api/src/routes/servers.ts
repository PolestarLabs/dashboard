/**
 * /api/server/* — guild / server data.
 * Thin Elysia controller — delegates to services/servers.
 */

import Elysia from "elysia";
import { authPlugin } from "@plugins/auth";
import { getServerData } from "@services/servers";

export const serversRoutes = new Elysia({ prefix: "/server", tags: ["servers"] })
  .use(authPlugin)

  // GET /server/:id
  .get("/:id", async ({ params, requireAuth, set }) => {
    requireAuth();
    const result = await getServerData(params.id);
    if (!result.ok) { set.status = result.status!; return result.message; }
    return result.data;
  });
