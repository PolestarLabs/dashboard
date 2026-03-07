/**
 * services/relationships.ts — Relationship business logic, decoupled from Elysia.
 */

import { getManyDiscordUsers } from "@helpers/discord";
import type { DB } from "@routes/types";

export async function getRelationships(
  query: { id?: string; uid?: string; page?: string },
  db: DB,
  redis: any,
): Promise<{ ok: boolean; status?: number; message?: string; data?: any[] }> {
  const skip = parseInt(query.page ?? "0", 10) || 0;
  let Relationships: any[] | null = null;

  if (query.id) {
    Relationships = await db.relationships
      .find({ _id: query.id })
      .populate({ path: "usersData", select: "profile.featuredMarriage id profile.tagline" });
    if (!Relationships?.length) return { ok: false, status: 404, message: "RELATIONSHIP ID NOT FOUND" };
  } else if (query.uid) {
    Relationships = await db.relationships
      .find({ users: query.uid })
      .limit(10)
      .skip(10 * skip)
      .populate("usersData");
    if (!Relationships?.length) return { ok: false, status: 404, message: "USER NOT FOUND" };
  } else {
    return { ok: false, status: 400, message: "Provide ?id= or ?uid=" };
  }

  const involvedSet = new Set<string>(
    Relationships.flatMap((r: any) => r.users as string[]).concat(query.uid ? [query.uid] : [])
  );
  const discordUsers = await getManyDiscordUsers([...involvedSet], redis);
  const discordMap = new Map(discordUsers.map((u) => [u.id, u]));

  const data = Relationships.map((rel: any) => ({
    type:            rel.type,
    initiative:      rel.initiative,
    ring:            rel.ring,
    ringCollection:  rel._doc?.ringCollection ?? rel.ringCollection ?? [],
    since:           rel.since,
    id:              rel._id,
    users:           rel.users,
    usersData: (rel.users as string[]).map((u: string) => {
      const discord = discordMap.get(u);
      const dbData  = rel.usersData?.find((x: any) => x.id === u) ?? {};
      return {
        id:               u,
        avatar:           discord?.avatar ?? null,
        bot:              discord?.bot    ?? false,
        username:         discord?.username ?? "Unknown",
        tagline:          dbData?.profile?.tagline ?? null,
        featuredMarriage: dbData?.profile?.featuredMarriage ?? null,
      };
    }),
  }));

  return { ok: true, data };
}
