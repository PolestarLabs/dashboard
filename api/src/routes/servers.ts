/**
 * /api/server/* — guild / server data.
 *
 * Port from: src/routes/api/servers.js
 */

import Elysia, { t } from "elysia";
import { authPlugin } from "@plugins/auth";
import { dbPlugin } from "@plugins/db";

export const serversRoutes = new Elysia({ prefix: "/server", tags: ["servers"] })
  .use(authPlugin)
  .use(dbPlugin)

  // GET /api/server/:id
  .get("/:id", async ({ params, requireAuth, db, set }) => {
    requireAuth();
    const DB = db as any;

    const [serverData, serverMetaData] = await Promise.all([
      DB.servers.get(params.id),
      DB.svMetaDB.get(params.id),
    ]);

    if (!serverData)     { set.status = 404; return "Not in Database"; }
    if (!serverMetaData) { set.status = 404; return "No metadata in Database"; }

    const payload: Record<string, unknown> = JSON.parse(JSON.stringify(serverData));
    payload.meta = JSON.parse(JSON.stringify(serverMetaData));
    // clientID is the bot's Discord application ID — exposed for dashboard use
    payload.clientID = process.env.BOT_CLIENT_ID ?? null;

    return payload;
  }, {
    params: t.Object({ id: t.String() }),
  });
