/**
 * /api/internal/* — service-to-service pings and admin tooling.
 *
 * Migration status: STUB (ping GET/POST ported as example)
 * Port from: src/routes/api/internal.js
 */

import Elysia, { t } from "elysia";
import { dbPlugin } from "@plugins/db";

export const internalRoutes = new Elysia({ prefix: "/api/internal", tags: ["internal"] })
  .use(dbPlugin)

  // GET /api/internal/ping
  .get("/ping", async ({ db }) => {
    const dbConn = db as Record<string, { findOne?: (...a: unknown[]) => Promise<unknown> }>;
    const pings = await dbConn.globals?.findOne?.({ id: 1, type: "pings" });
    return pings ?? {};
  })

  // POST /api/internal/ping
  .post("/ping", async ({ body, db, set }) => {
    const { instance, cluster, last, diff } = body;
    const dbConn = db as Record<string, { updateOne?: (...a: unknown[]) => Promise<unknown> }>;
    await dbConn.globals?.updateOne?.(
      { id: 1, type: "pings" },
      { [instance]: { [`cluster_${cluster}`]: { last: new Date(last).getTime(), diff } } },
      { upsert: true }
    );
    set.status = 200;
    return "OK";
  }, {
    body: t.Object({
      instance: t.String(),
      cluster:  t.Union([t.String(), t.Number()]),
      last:     t.Union([t.String(), t.Number()]),
      diff:     t.Optional(t.Number()),
    }),
  });
