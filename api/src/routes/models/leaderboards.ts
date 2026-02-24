/**
 * models/leaderboards.ts — Elysia validation schemas for /leaderboards routes.
 */

import { t } from "elysia";

export const LeaderboardUserParams = t.Object({
  userID: t.String(),
});

export const LeaderboardServerParams = t.Object({
  serverID: t.String(),
});

export const LeaderboardPageQuery = t.Object({
  page: t.Optional(t.String()),
});

export const LeaderboardUserServerParams = t.Object({
  serverID: t.String(),
  userID:   t.String(),
});
