/**
 * /api/galleries/fanart/* — fanart community gallery.
 *
 * Port from: src/routes/api/_main.js (fanart routes)
 */

import Elysia, { t } from "elysia";
import { authPlugin } from "@plugins/auth";
import { dbPlugin } from "@plugins/db";

export const fanartRoutes = new Elysia({ prefix: "/galleries/fanart", tags: ["fanart"] })
  .use(dbPlugin)
  .use(authPlugin)

  // DELETE /api/galleries/fanart/:id
  .delete("/:id", async ({ params, apiUser, requireAuth, db, set }) => {
    requireAuth();
    const DB = db as any;

    const oldData = await DB.fanart.get(params.id);
    if (!oldData)                          { set.status = 404; return "Not Found"; }
    if (oldData.author_ID !== apiUser.id)  { set.status = 403; return "Forbidden"; }

    await DB.fanart.remove({ id: params.id });
    set.status = 200;
    return "DELETED";
  }, {
    params: t.Object({ id: t.String() }),
  })

  // PUT /api/galleries/fanart/:id/:what
  .put("/:id/:what", async ({ params, body, apiUser, requireAuth, db, set }) => {
    requireAuth();
    const DB = db as any;

    const oldData = await DB.fanart.get(params.id);
    if (!oldData)                          { set.status = 404; return "Not Found"; }
    if (oldData.author_ID !== apiUser.id)  { set.status = 403; return "Forbidden"; }

    if (params.what === "twitter") {
      const result = await DB.fanart.updateMany({ author_ID: oldData.author_ID }, { $set: { artistTwit: body.value } });
      return result;
    }
    if (params.what === "link") {
      const result = await DB.fanart.updateMany({ author_ID: oldData.author_ID }, { $set: { artistlink: body.value } });
      return result;
    }

    // Generic field update (title / description)
    const payload: Record<string, unknown> = {};
    if (body.title)       payload.title       = body.title;
    if (body.description) payload.description = body.description;

    return DB.fanart.set({ id: params.id }, { $set: payload });
  }, {
    params: t.Object({ id: t.String(), what: t.String() }),
    body:   t.Object({
      value:       t.Optional(t.String()),
      title:       t.Optional(t.String()),
      description: t.Optional(t.String()),
    }),
  });
