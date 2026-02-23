/**
 * /api/relationships/* — user marriage / relationship data.
 *
 * Port from: src/routes/api/_main.js (relationships routes)
 */

import Elysia, { t } from "elysia";
import { dbPlugin } from "@plugins/db";
import { redisPlugin } from "@plugins/redis";
import { getManyDiscordUsers } from "@helpers/discord";

export const relationshipsRoutes = new Elysia({ prefix: "/api/relationships", tags: ["relationships"] })
  .use(dbPlugin)
  .use(redisPlugin)

  // GET /api/relationships?id=&uid=&page=
  .get("/", async ({ query, db, redis, set }) => {
    const DB   = db as any;
    const skip = parseInt(query.page ?? "0", 10) || 0;

    let Relationships: any[] | null = null;

    if (query.id) {
      Relationships = await DB.relationships
        .find({ _id: query.id })
        .populate({ path: "usersData", select: "featuredMarriage id modules.tagline" })
        .lean();
      if (!Relationships?.length) { set.status = 404; return "RELATIONSHIP ID NOT FOUND"; }
    } else if (query.uid) {
      Relationships = await DB.relationships
        .find({ users: query.uid })
        .limit(10)
        .skip(10 * skip)
        .populate("usersData")
        .lean();
      if (!Relationships?.length) { set.status = 404; return "USER NOT FOUND"; }
    } else {
      set.status = 400;
      return "Provide ?id= or ?uid=";
    }

    // Resolve Discord profiles for all users involved
    const involvedSet = new Set<string>(
      Relationships.flatMap((r: any) => r.users as string[]).concat(query.uid ? [query.uid] : [])
    );
    const discordUsers = await getManyDiscordUsers([...involvedSet], redis);
    const discordMap = new Map(discordUsers.map((u) => [u.id, u]));

    return Relationships.map((rel: any) => ({
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
          tagline:          dbData?.modules?.tagline ?? null,
          featuredMarriage: dbData?.featuredMarriage ?? null,
        };
      }),
    }));
  }, {
    query: t.Object({
      id:   t.Optional(t.String()),
      uid:  t.Optional(t.String()),
      page: t.Optional(t.String()),
    }),
  });


import Elysia, { t } from "elysia";
import { dbPlugin } from "@plugins/db";
import { redisPlugin } from "@plugins/redis";

export const relationshipsRoutes = new Elysia({ prefix: "/api/relationships", tags: ["relationships"] })
  .use(dbPlugin)
  .use(redisPlugin)

  // GET /api/relationships?id=&uid=&page=
  .get("/", async ({ query }) => {
    return { _stub: true, message: "Not yet ported to Elysia", query };
  }, {
    query: t.Object({
      id:   t.Optional(t.String()),
      uid:  t.Optional(t.String()),
      page: t.Optional(t.String()),
    }),
  });
