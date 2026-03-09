/**
 * services/commends.ts — Commend / reputation business logic.
 * Extracted from services/users.ts.
 */

import { db } from "@plugins/db";
import { getManyDiscordUsers } from "utils/discord";

export async function getCommendsSimple(userId: string) {
  return db.commends.parseFull(userId);
}

export async function getCommendsFull(userId: string) {
  const userCommends = await db.commends.parseFull(userId, { _id: 0, __v: 0 });
  if (!userCommends) return null;

  const usersInSet = [...new Set([
    ...userCommends.whoIn.map((u: any) => u.id).slice(0, 10),
    ...userCommends.whoOut.map((u: any) => u.id).slice(0, 10),
  ])] as string[];

  const userData = await getManyDiscordUsers(usersInSet);
  const whoIn  = userCommends.whoIn.sort((a: any, b: any) => b.count - a.count) || [];
  const whoOut = userCommends.whoOut.sort((a: any, b: any) => b.count - a.count) || [];
  const totalIn  = userCommends.totalIn  || 0;
  const totalOut = userCommends.totalOut || 0;
  const average    = Math.floor(totalIn / whoIn.length) || 0;
  const normalized = Math.floor((totalIn * whoIn.length) / (totalIn / average)) || 0;

  return { userData, whoIn, whoOut, totalIn, totalOut, average, normalized };
}

export async function getCommendRank(userId: string, endpoint: string) {
  const count = (await db.commends.get(userId))?.whoIn?.reduce(
    (a: any, b: any) => ({ count: a.count + b.count }),
  )?.count;
  const ranks: any[] = await db.commends.aggregate([
    { $addFields: { countIn: { $sum: "$whoIn.count" }, countOut: { $sum: "$whoOut.count" } } },
    { $match: { [endpoint === "in" ? "countIn" : "countOut"]: { $gt: count } } },
    { $project: { id: 1, whoOut: 1, whoIn: 1, pplIn: { $size: "$whoIn" }, pplOut: { $size: "$whoOut" } } },
    { $count: "count" },
  ]);
  return { rank: ranks[0]?.count, count };
}
