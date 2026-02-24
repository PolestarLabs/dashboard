/**
 * /api/user/* — user profiles, inventory, handle lookup.
 * Thin Elysia controller — delegates to services/users for business logic.
 */

import Elysia from "elysia";
import { authPlugin } from "@plugins/auth";
import { redisPlugin } from "@plugins/redis";
import { dbPlugin } from "@plugins/db";

import {
  UserSearchQuery, HandleCheckQuery, UserIdParams,
  CommendQuery, CommendEndpointParams, FanartHeartParams,
} from "@routes/schemas";

import { searchUsers, parseUserAndReturn, getUserInventory, getUserStickers, getUserMedals, getUserBackgrounds } from "@routes/services/users";
import { getCommendsSimple, getCommendsFull, getCommendRank } from "@routes/services/commends";
import { toggleFanartHeart } from "@routes/services/fanart";
import { getGallerySaves, getGalleryFanart } from "@routes/services/galleries";

import type { DB } from "@routes/types";

export const usersRoutes = new Elysia({ prefix: "/user", tags: ["users"] })
  .use(authPlugin)
  .use(redisPlugin)
  .use(dbPlugin)

  .get("/search", ({ query, db, redis }) =>
    searchUsers(query as Record<string, string | undefined>, db as DB, redis),
  { query: UserSearchQuery })

  .get("/check_handle", async ({ query, db }) => {
    if (!query.handle) return { available: false };
    const exists = await (db as DB).users.get({ personalhandle: query.handle });
    return { available: !exists, handle: query.handle };
  }, { query: HandleCheckQuery })

  .get("/:id/inventory", async ({ params, db, set }) => {
    const result = await getUserInventory(params.id, db as DB);
    if (!result) { set.status = 404; return "Not Found"; }
    return result;
  }, { params: UserIdParams })

  .get("/:id/stickers", async ({ params, db, set }) => {
    const result = await getUserStickers(params.id, db as DB);
    if (!result) { set.status = 404; return "Not Found"; }
    return result;
  }, { params: UserIdParams })

  .get("/:id/medals", async ({ params, db, set }) => {
    const result = await getUserMedals(params.id, db as DB);
    if (!result) { set.status = 404; return "Not Found"; }
    return result;
  }, { params: UserIdParams })

  .get("/:id/bgs", async ({ params, db, set }) => {
    const result = await getUserBackgrounds(params.id, db as DB);
    if (!result) { set.status = 404; return "Not Found"; }
    return result;
  }, { params: UserIdParams })

  .get("/:id/backgrounds", async ({ params, db, set }) => {
    const result = await getUserBackgrounds(params.id, db as DB);
    if (!result) { set.status = 404; return "Not Found"; }
    return result;
  }, { params: UserIdParams })

  .get("/:id/commends", async ({ params, query, db, redis, set }) => {
    if (!query.full) return getCommendsSimple(params.id, db as DB);
    const result = await getCommendsFull(params.id, db as DB, redis);
    if (!result) { set.status = 404; return null; }
    return result;
  }, { params: UserIdParams, query: CommendQuery })

  .get("/:id/commends/:endpoint", ({ params, db }) =>
    getCommendRank(params.id, params.endpoint, db as DB),
  { params: CommendEndpointParams })

  .post("/fanart-hearts/:operation/:id", async ({ params, requireAuth, db, set }) => {
    const user = requireAuth();
    const result = await toggleFanartHeart(user.id, params.id, params.operation, db as DB);
    set.status = result.status;
    return result.message;
  }, { params: FanartHeartParams })

  .get("/:id/galleries/saves", ({ params, db }) =>
    getGallerySaves(params.id, db as DB),
  { params: UserIdParams })

  .get("/:id/galleries/fanart", ({ params, apiUser, db }) =>
    getGalleryFanart(params.id, apiUser?.id, db as DB),
  { params: UserIdParams })

  .get("/:id", async ({ params, apiUser, db, redis, set }) => {
    const uID = params.id === "@me" ? (apiUser?.id ?? null) : params.id;
    if (!uID) { set.status = 401; return { message: "Authentication required for @me" }; }
    const { status, body } = await parseUserAndReturn(uID, db as DB, redis);
    set.status = status;
    return body;
  }, { params: UserIdParams });

