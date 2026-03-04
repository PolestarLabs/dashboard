/**
 * /api/internal/* — service-to-service pings and admin tooling.
 * Thin Elysia controller — delegates to services/internal.
 */

import Elysia from "elysia";
import { dbPlugin } from "@plugins/db";
import { PingFilterQuery, PingBody } from "@routes/schemas";
import { getPings, upsertPing } from "services/internal";

export const internalRoutes = new Elysia({ prefix: "/internal", tags: ["internal"] })
  .use(dbPlugin)

  .get("/ping", async ({ query, db, set }) => {
    const result = await getPings(query.filter, db as any);
    if (!result.ok) { set.status = result.status!; return result.message; }
    return result.data;
  }, { query: PingFilterQuery })

  .post("/ping", async ({ body, db, set }) => {
    const result = await upsertPing(body.instance, body.cluster as string, body.last as string, body.diff, db as any);
    if (!result.ok) { set.status = 400; return "ERROR"; }
    set.status = 200;
    return "OK";
  }, { body: PingBody });
