/**
 * /api/galleries/fanart/* — fanart community gallery.
 * Thin Elysia controller — delegates to services/fanart.
 */

import Elysia from "elysia";
import { authPlugin } from "@plugins/auth";
import { dbPlugin } from "@plugins/db";
import { FanartIdParams, FanartUpdateParams, FanartUpdateBody } from "@routes/schemas";
import { deleteFanart, updateFanart } from "@routes/services/fanart";

export const fanartRoutes = new Elysia({ prefix: "/galleries/fanart", tags: ["fanart"] })
  .use(dbPlugin)
  .use(authPlugin)

  .delete("/:id", async ({ params, requireAuth, db, set }) => {
    const apiUser = requireAuth();
    const result = await deleteFanart(params.id, apiUser.id, db as any);
    set.status = result.status;
    return result.message;
  }, { params: FanartIdParams })

  .put("/:id/:what", async ({ params, body, requireAuth, db, set }) => {
    const apiUser = requireAuth();
    const result = await updateFanart(params.id, params.what, apiUser.id, body, db as any);
    if (!result.ok) { set.status = result.status!; return result.message; }
    return result.data;
  }, { params: FanartUpdateParams, body: FanartUpdateBody });
