/**
 * /api/internal/* — service-to-service pings and admin tooling.
 *
 * Port from: src/routes/api/internal.js
 */

import Elysia, { t } from "elysia";
import { dbPlugin } from "@plugins/db";

export const internalRoutes = new Elysia({ prefix: "/api/internal", tags: ["internal"] })
  .use(dbPlugin)

  // GET /api/internal/ping?filter=
  .get("/ping", async ({ query, db, set }) => {
    const DB = db as any;
    let pings = await DB.globals.findOne({ id: 1, type: "pings" }).lean();

    if (query.filter) {
      pings = pings?.[query.filter];
      if (!pings) { set.status = 404; return "NOT FOUND"; }
    }

    return pings ?? {};
  }, {
    query: t.Object({ filter: t.Optional(t.String()) }),
  })

  // POST /api/internal/ping  — bot cluster heartbeat
  .post("/ping", async ({ body, db, set }) => {
    const DB = db as any;
    const { instance, cluster, last, diff } = body;

    if (!instance || !last) { set.status = 400; return "ERROR"; }

    await DB.globals.updateOne(
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
