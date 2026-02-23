/**
 * /api/leaderboards/* — server and global XP rankings.
 *
 * Migration status: STUB (fully typed from Express source)
 * Port from: src/routes/api/_main.js (leaderboard routes)
 */

import Elysia, { t } from "elysia";
import { authPlugin } from "@plugins/auth";
import { dbPlugin } from "@plugins/db";

export const leaderboardsRoutes = new Elysia({ prefix: "/api/leaderboards", tags: ["leaderboards"] })
  .use(authPlugin)
  .use(dbPlugin)

  // GET /api/leaderboards/user/:userID — own rank across all servers
  .get("/user/:userID", async ({ params, apiUser, requireAuth, db }) => {
    requireAuth();
    if (apiUser.id !== params.userID) throw new Error("Forbidden");
    return { _stub: true, message: "Not yet ported to Elysia", userID: params.userID };
  }, {
    params: t.Object({ userID: t.String() }),
  })

  // GET /api/leaderboards/:serverID — paginated server leaderboard
  .get("/:serverID", async ({ params, query, db }) => {
    return { _stub: true, message: "Not yet ported to Elysia", serverID: params.serverID, page: query.page };
  }, {
    params: t.Object({ serverID: t.String() }),
    query:  t.Object({ page: t.Optional(t.String()) }),
  })

  // GET /api/leaderboards/:serverID/:userID — single user rank in a server
  .get("/:serverID/:userID", async ({ params, db }) => {
    return { _stub: true, message: "Not yet ported to Elysia", ...params };
  }, {
    params: t.Object({ serverID: t.String(), userID: t.String() }),
  });
