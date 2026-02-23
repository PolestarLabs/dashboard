/**
 * /api/galleries/fanart/* — fanart community gallery.
 *
 * Migration status: STUB (delete + put ported structurally)
 * Port from: src/routes/api/_main.js (fanart routes)
 */

import Elysia, { t } from "elysia";
import { authPlugin } from "@plugins/auth";
import { dbPlugin } from "@plugins/db";

export const fanartRoutes = new Elysia({ prefix: "/api/galleries/fanart", tags: ["fanart"] })
  .use(authPlugin)
  .use(dbPlugin)

  // DELETE /api/galleries/fanart/:id
  .delete("/:id", async ({ params, apiUser, requireAuth, db, set }) => {
    requireAuth();
    return { _stub: true, message: "Not yet ported to Elysia", id: params.id };
  }, {
    params: t.Object({ id: t.String() }),
  })

  // PUT /api/galleries/fanart/:id/:what
  .put("/:id/:what", async ({ params, body, requireAuth }) => {
    requireAuth();
    return { _stub: true, message: "Not yet ported to Elysia", ...params };
  }, {
    params: t.Object({ id: t.String(), what: t.String() }),
    body:   t.Object({ value: t.Optional(t.String()), title: t.Optional(t.String()), description: t.Optional(t.String()) }),
  });
