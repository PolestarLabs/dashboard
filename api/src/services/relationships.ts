/**
 * services/relationships.ts — Relationship business logic, decoupled from Elysia.
 */

import { db } from "@plugins/db";
import { getManyDiscordUsers } from "utils/discord";
import type { ServiceResponse } from "@definitions/Misc";

export async function getRelationships(
  query: { id?: string; uid?: string; page?: string },
  _db = db,
  _extra?: any,
): Promise<ServiceResponse<any[]>> {
  const skip = parseInt(query.page ?? "0", 10) || 0;
  let Relationships: any[] | null = null;

  if (query.id) {
    Relationships = await _db.relationships
      .find({ _id: query.id })
      .populate({ path: "usersData", select: "profile.featuredMarriage id profile.tagline" })
      .lean();
    if (!Relationships?.length) return { ok: false, status: 404, message: "RELATIONSHIP ID NOT FOUND" };
  } else if (query.uid) {
    Relationships = await _db.relationships
      .find({ users: query.uid })
      .limit(10)
      .skip(10 * skip)
      .populate("usersData")
      .lean();
    if (!Relationships?.length) return { ok: false, status: 404, message: "USER NOT FOUND" };
  } else {
    return { ok: false, status: 400, message: "Provide ?id= or ?uid=" };
  }

  const involvedSet = new Set<string>(
    Relationships.flatMap((r: any) => r.users as string[]).concat(query.uid ? [query.uid] : [])
  );
  const discordUsers = await getManyDiscordUsers([...involvedSet]);
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
