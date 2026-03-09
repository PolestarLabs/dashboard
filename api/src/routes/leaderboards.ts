/**
 * /api/leaderboards/* — server and global XP rankings.
 * Thin Elysia controller — delegates to services/leaderboards.
 */

import Elysia from "elysia";
import { authPlugin } from "@plugins/auth";
import { getUserRanks, getServerLeaderboard, getUserServerRank } from "@services/leaderboards";

export const leaderboardsRoutes = new Elysia({ prefix: "/leaderboards", tags: ["leaderboards"] })
  .use(authPlugin)

  // GET /leaderboards/user/:userID
  .get("/user/:userID", async ({ params, requireAuth, set }) => {
    const apiUser = requireAuth();
    if (apiUser.id !== params.userID) { set.status = 403; return null; }
    return getUserRanks(params.userID);
  })

  // GET /leaderboards/:serverID
  .get("/:serverID", ({ params, query }) =>
    getServerLeaderboard(params.serverID, parseInt(query.page ?? "0")))

  // GET /leaderboards/:serverID/:userID
  .get("/:serverID/:userID", ({ params }) =>
    getUserServerRank(params.serverID, params.userID));
