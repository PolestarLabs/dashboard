/**
 * /api/user/* — user profiles, inventory, handle lookup.
 *
 * Migration status: STUB — returns 501 for endpoints not yet ported.
 * Port from: src/routes/api/users.js
 */

import Elysia, { t } from "elysia";
import { authPlugin } from "@plugins/auth";
import { redisPlugin } from "@plugins/redis";
import { dbPlugin } from "@plugins/db";

export const usersRoutes = new Elysia({ prefix: "/api/user", tags: ["users"] })
  .use(authPlugin)
  .use(redisPlugin)
  .use(dbPlugin)

  // GET /api/user/search?id=&name=…
  .get("/search", async ({ query, db, redis }) => {
    // TODO: full port from users.js - search by query params
    return { _stub: true, message: "Not yet ported to Elysia", query };
  }, {
    query: t.Object({
      id:             t.Optional(t.String()),
      name:           t.Optional(t.String()),
      donator:        t.Optional(t.String()),
      personalhandle: t.Optional(t.String()),
      skip:           t.Optional(t.String()),
      lim:            t.Optional(t.String()),
    }),
  })

  // GET /api/user/check_handle?handle=
  .get("/check_handle", async ({ query, db }) => {
    return { _stub: true, message: "Not yet ported to Elysia", query };
  }, {
    query: t.Object({ handle: t.Optional(t.String()) }),
  })

  // GET /api/user/@me  or  /api/user/:id
  .get("/:id", async ({ params, apiUser, db, redis }) => {
    return { _stub: true, message: "Not yet ported to Elysia", id: params.id };
  }, {
    params: t.Object({ id: t.String() }),
  })

  // GET /api/user/:id/inventory
  .get("/:id/inventory", async ({ params, db }) => {
    return { _stub: true, message: "Not yet ported to Elysia", id: params.id };
  }, {
    params: t.Object({ id: t.String() }),
  });
