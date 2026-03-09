/**
 * /api/internal/* — service-to-service pings and admin tooling.
 * Thin Elysia controller — delegates to services/internal.
 */

import Elysia from "elysia";
import { t } from "elysia";
import { getPings, upsertPing } from "@services/internal";

const PingBody = t.Object({
  instance: t.String(),
  cluster:  t.Union([t.String(), t.Number()]),
  last:     t.Union([t.String(), t.Number()]),
  diff:     t.Optional(t.Number()),
});

export const internalRoutes = new Elysia({ prefix: "/internal", tags: ["internal"] })

  .get("/ping", async ({ query, set }) => {
    const result = await getPings(query.filter);
    if (!result.ok) { set.status = result.status!; return result.message; }
    return result.data;
  })

  .post("/ping", async ({ body, set }) => {
    const result = await upsertPing(body.instance, body.cluster as string, body.last as string, body.diff);
    if (!result.ok) { set.status = 400; return "ERROR"; }
    set.status = 200;
    return "OK";
  }, { body: PingBody });
