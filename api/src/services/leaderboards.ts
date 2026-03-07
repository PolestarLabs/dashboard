/**
 * services/leaderboards.ts — Leaderboard business logic, decoupled from Elysia.
 */

import type { DB } from "@routes/types";

export async function getUserRanks(userId: string, db: DB) {
  return db.localranks.find({ user: userId }, { _id: 0, __v: 0 });
}

export async function getServerLeaderboard(serverId: string, page: number, db: DB) {
  const p = Math.abs(page - 1);
  const [serverData, total] = await Promise.all([
    db.localranks.find({ server: serverId }, { _id: 0, __v: 0 })
      .limit(50).skip(50 * p),
    db.localranks.find({ server: serverId }).count(),
  ]);
  return {
    currentPage: p + 1,
    totalItems:  total,
    totalPages:  Math.floor(total / 50),
    data:        serverData,
    lastUpdated: new Date(),
  };
}

export async function getUserServerRank(serverId: string, userId: string, db: DB) {
  return db.localranks.get({ user: userId, server: serverId }, { _id: 0, __v: 0 });
}
