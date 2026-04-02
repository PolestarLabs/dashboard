/**
 * /api/user/* — user profiles, inventory, handle lookup.
 */

import Elysia from "elysia";
import { authPlugin } from "@plugins/auth";
import { db } from "@plugins/db";

import { searchUsers, parseUserAndReturn, getUserInventory, getUserStickers, getUserMedals, getUserBackgrounds } from "@services/users";
import { getCommendsSimple, getCommendsFull, getCommendRank } from "@services/commends";
import { toggleFanartHeart } from "@services/fanart";
import { getGallerySaves, getGalleryFanart } from "@services/galleries";

export const usersRoutes = new Elysia({ prefix: "/user", tags: ["users"] })
  .use(authPlugin)

  // GET /user/search
  .get("/search", ({ query }) =>
    searchUsers(query as Record<string, string | undefined>))

  // GET /user/check_handle
  .get("/check_handle", async ({ query }) => {
    if (!query.handle) return { available: false };
    const exists = await db.users.get({ personalhandle: query.handle });
    return { available: !exists, handle: query.handle };
  })

  // GET /user/:id/inventory
  .get("/:id/inventory", async ({ params, set }) => {
    const result = await getUserInventory(params.id);
    if (!result) { set.status = 404; return "Not Found"; }
    return result;
  })

  // GET /user/:id/stickers
  .get("/:id/stickers", async ({ params, set }) => {
    const result = await getUserStickers(params.id);
    if (!result) { set.status = 404; return "Not Found"; }
    return result;
  })

  // GET /user/:id/medals
  .get("/:id/medals", async ({ params, set }) => {
    const result = await getUserMedals(params.id);
    if (!result) { set.status = 404; return "Not Found"; }
    return result;
  })

  // GET /user/:id/bgs
  .get("/:id/bgs", async ({ params, set }) => {
    const result = await getUserBackgrounds(params.id);
    if (!result) { set.status = 404; return "Not Found"; }
    return result;
  })

  // GET /user/:id/backgrounds
  .get("/:id/backgrounds", async ({ params, set }) => {
    const result = await getUserBackgrounds(params.id);
    if (!result) { set.status = 404; return "Not Found"; }
    return result;
  })

  // GET /user/:id/commends
  .get("/:id/commends", async ({ params, query, set }) => {
    if (!query.full) return getCommendsSimple(params.id);
    const result = await getCommendsFull(params.id);
    if (!result) { set.status = 404; return null; }
    return result;
  })

  // GET /user/:id/commends/:endpoint
  .get("/:id/commends/:endpoint", ({ params }) =>
    getCommendRank(params.id, params.endpoint))

  // POST /user/fanart-hearts/:operation/:id
  .post("/fanart-hearts/:operation/:id", async ({ params, requireAuth, set }) => {
    const user = requireAuth();
    const result = await toggleFanartHeart(user.id, params.id, params.operation as "add" | "remove");
    set.status = result.status;
    return result.message;
  })

  // GET /user/:id/galleries/saves
  .get("/:id/galleries/saves", ({ params }) =>
    getGallerySaves(params.id))

  // GET /user/:id/galleries/fanart
  .get("/:id/galleries/fanart", ({ params, apiUser }) =>
    getGalleryFanart(params.id, apiUser?.id))

  // GET /user/:id
  .get("/:id", async ({ params, apiUser, set }) => {
    const uID = params.id === "@me" ? (apiUser?.id ?? null) : params.id;
    if (!uID) { set.status = 401; return { message: "Authentication required for @me" }; }
    const { status, body } = await parseUserAndReturn(uID);
    set.status = status;
    return body;
  });

