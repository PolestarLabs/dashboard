/**
 * /api/prime/* — Prime subscription management.
 * Thin Elysia controller — delegates to services/prime.
 */

import Elysia from "elysia";
import { authPlugin } from "@plugins/auth";
import { dbPlugin } from "@plugins/db";

import {
  PrimeServerParams, PatreonFinderParams,
  PatreonTopParams, PatreonTotalParams, PatreonTotalQuery,
} from "@routes/_schemas";

import {
  getPatreonPayload, findPatron, topPatrons,
  totalRevenue, removePrimeFromServer,
} from "@services/prime";

export const primeRoutes = new Elysia({ prefix: "/prime", tags: ["prime"] })
  .use(authPlugin)
  .use(dbPlugin)

  .delete("/:serverID", async ({ params, requireAuth, db, set }) => {
    const apiUser = requireAuth();
    const result = await removePrimeFromServer(apiUser.id, params.serverID, db);
    if (!result.ok) { set.status = 403; return { error: result.error }; }
    return { success: true };
  }, { params: PrimeServerParams })

  .get("/patreon/raw", async ({ requireRole }) => {
    requireRole("first_party");
    return getPatreonPayload();
  })

  .get("/patreon/check/:finder", async ({ params, requireRole }) => {
    requireRole("first_party");
    const payload = await getPatreonPayload();
    return findPatron(payload, params.finder);
  }, { params: PatreonFinderParams })

  .get("/checkUser/:finder", async ({ params, requireRole }) => {
    requireRole("first_party");
    const payload = await getPatreonPayload();
    return findPatron(payload, params.finder);
  }, { params: PatreonFinderParams })

  .get("/patreon/top/:max", async ({ params, requireRole }) => {
    requireRole("first_party");
    const payload = await getPatreonPayload();
    return topPatrons(payload, Math.max(parseInt(params.max, 10), 10), true);
  }, { params: PatreonTopParams })

  .get("/patreon/top/alltime/:max", async ({ params, requireRole }) => {
    requireRole("first_party");
    const payload = await getPatreonPayload();
    return topPatrons(payload, Math.max(parseInt(params.max, 10), 10), false);
  }, { params: PatreonTopParams })

  .get("/patreon/total/:scale", async ({ params, query, requireRole }) => {
    requireRole("first_party");
    const payload = await getPatreonPayload();
    return totalRevenue(payload, params.scale, query.active !== "false");
  }, { params: PatreonTotalParams, query: PatreonTotalQuery });
