/**
 * /api/prime/* — Prime subscription management.
 * Thin Elysia controller — delegates to services/prime.
 */

import Elysia from "elysia";
import { authPlugin } from "@plugins/auth";
import { getPatreonPayload, findPatron, topPatrons, totalRevenue, removePrimeFromServer } from "@services/prime";

export const primeRoutes = new Elysia({ prefix: "/prime", tags: ["prime"] })
  .use(authPlugin)

  .delete("/:serverID", async ({ params, requireAuth, set }) => {
    const apiUser = requireAuth();
    const result = await removePrimeFromServer(apiUser.id, params.serverID);
    if (!result.ok) { set.status = 403; return { error: result.error }; }
    return { success: true };
  })

  .get("/patreon/raw", async ({ requireRole }) => {
    requireRole("first_party");
    return getPatreonPayload();
  })

  .get("/patreon/check/:finder", async ({ params, requireRole }) => {
    requireRole("first_party");
    const payload = await getPatreonPayload();
    return findPatron(payload, params.finder);
  })

  .get("/checkUser/:finder", async ({ params, requireRole }) => {
    requireRole("first_party");
    const payload = await getPatreonPayload();
    return findPatron(payload, params.finder);
  })

  .get("/patreon/top/:max", async ({ params, requireRole }) => {
    requireRole("first_party");
    const payload = await getPatreonPayload();
    return topPatrons(payload, Math.max(parseInt(params.max, 10), 10), true);
  })

  .get("/patreon/top/alltime/:max", async ({ params, requireRole }) => {
    requireRole("first_party");
    const payload = await getPatreonPayload();
    return topPatrons(payload, Math.max(parseInt(params.max, 10), 10), false);
  })

  .get("/patreon/total/:scale", async ({ params, query, requireRole }) => {
    requireRole("first_party");
    const payload = await getPatreonPayload();
    return totalRevenue(payload, params.scale, query.active !== "false");
  });
