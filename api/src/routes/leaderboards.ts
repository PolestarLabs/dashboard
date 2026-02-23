/**
 * /api/leaderboards/* — server and global XP rankings.
 *
 * Port from: src/routes/api/_main.js (leaderboard routes)
 */

import Elysia, { t } from "elysia";
import { authPlugin } from "@plugins/auth";
import { dbPlugin } from "@plugins/db";

export const leaderboardsRoutes = new Elysia({ prefix: "/api/leaderboards", tags: ["leaderboards"] })
  .use(authPlugin)
  .use(dbPlugin)

  // GET /api/leaderboards/user/:userID — all server ranks for one user (self-only)
  .get("/user/:userID", async ({ params, apiUser, requireAuth, db, set }) => {
    requireAuth();
    if (apiUser.id !== params.userID) { set.status = 403; return null; }
    const DB = db as any;
    return DB.localranks.find({ user: params.userID }, { _id: 0, __v: 0 }).lean();
  }, {
    params: t.Object({ userID: t.String() }),
  })

  // GET /api/leaderboards/:serverID — paginated server leaderboard
  .get("/:serverID", async ({ params, query, db }) => {
    const DB  = db as any;
    const page = Math.abs(parseInt(query.page ?? "0") - 1);

    const [serverData, total] = await Promise.all([
      DB.localranks.find({ server: params.serverID }, { _id: 0, __v: 0 })
        .limit(50).skip(50 * page).lean(),
      DB.localranks.find({ server: params.serverID }).count(),
    ]);

    return {
      currentPage: page + 1,
      totalItems:  total,
      totalPages:  Math.floor(total / 50),
      data:        serverData,
      lastUpdated: new Date(),
    };
  }, {
    params: t.Object({ serverID: t.String() }),
    query:  t.Object({ page: t.Optional(t.String()) }),
  })

  // GET /api/leaderboards/:serverID/:userID — single user in a server
  .get("/:serverID/:userID", async ({ params, db }) => {
    const DB = db as any;
    return DB.localranks.get({ user: params.userID, server: params.serverID }, { _id: 0, __v: 0 });
  }, {
    params: t.Object({ serverID: t.String(), userID: t.String() }),
  });


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
