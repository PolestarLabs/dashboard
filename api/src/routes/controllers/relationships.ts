/**
 * /api/relationships/* — user marriage / relationship data.
 * Thin Elysia controller — delegates to services/relationships.
 */

import Elysia from "elysia";
import { dbPlugin } from "@plugins/db";
import { redisPlugin } from "@plugins/redis";
import { RelationshipQuery } from "@routes/schemas";
import { getRelationships } from "services/relationships";

export const relationshipsRoutes = new Elysia({ prefix: "/relationships", tags: ["relationships"] })
  .use(dbPlugin)
  .use(redisPlugin)

  .get("/", async ({ query, db, redis, set }) => {
    const result = await getRelationships(query, db as any, redis);
    if (!result.ok) { set.status = result.status!; return result.message; }
    return result.data;
  }, { query: RelationshipQuery });
