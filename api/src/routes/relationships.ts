/**
 * /api/relationships/* — user marriage / relationship data.
 *
 * Migration status: STUB
 * Port from: src/routes/api/_main.js (relationships routes)
 */

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
