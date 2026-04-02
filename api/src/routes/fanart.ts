/**
 * /api/galleries/fanart/* — fanart community gallery.
 * Thin Elysia controller — delegates to services/fanart.
 */

import Elysia from "elysia";
import { authPlugin } from "@plugins/auth";
import { deleteFanart, updateFanart } from "@services/fanart";

export const fanartRoutes = new Elysia({ prefix: "/galleries/fanart", tags: ["fanart"] })
  .use(authPlugin)

  .delete("/:id", async ({ params, requireAuth, set }) => {
    const apiUser = requireAuth();
    const result = await deleteFanart(params.id, apiUser.id);
    set.status = result.status;
    return result.message;
  })

  .put("/:id/:what", async ({ params, body, requireAuth, set }) => {
    const apiUser = requireAuth();
    const result = await updateFanart(params.id, params.what, apiUser.id, body as Record<string, string>);
    if (!result.ok) { set.status = result.status!; return result.message; }
    return result.data;
  });
