/**
 * /api/leaderboards/* — server and global XP rankings.
 * Thin Elysia controller — delegates to services/leaderboards.
 */

import Elysia from "elysia";
import { authPlugin } from "@plugins/auth";
import { dbPlugin } from "@plugins/db";

import {
  LeaderboardUserParams, LeaderboardServerParams,
  LeaderboardPageQuery, LeaderboardUserServerParams,
} from "@routes/_schemas";

import {
  getUserRanks, getServerLeaderboard, getUserServerRank,
} from "@services/leaderboards";

export const leaderboardsRoutes = new Elysia({ prefix: "/leaderboards", tags: ["leaderboards"] })
  .use(authPlugin)
  .use(dbPlugin)

  .get("/user/:userID", async ({ params, requireAuth, db, set }) => {
    const apiUser = requireAuth();
    if (apiUser.id !== params.userID) { set.status = 403; return null; }
    return getUserRanks(params.userID, db as any);
  }, { params: LeaderboardUserParams })

  .get("/:serverID", ({ params, query, db }) =>
    getServerLeaderboard(params.serverID, parseInt(query.page ?? "0"), db as any),
  { params: LeaderboardServerParams, query: LeaderboardPageQuery })

  .get("/:serverID/:userID", ({ params, db }) =>
    getUserServerRank(params.serverID, params.userID, db as any),
  { params: LeaderboardUserServerParams });
