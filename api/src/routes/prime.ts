/**
 * /api/prime/* — Prime subscription management.
 *
 * Migration status: STUB
 * Port from: src/routes/api/prime.js
 */

import Elysia, { t } from "elysia";
import { authPlugin } from "@plugins/auth";
import { dbPlugin } from "@plugins/db";

export const primeRoutes = new Elysia({ prefix: "/api/prime", tags: ["prime"] })
  .use(authPlugin)
  .use(dbPlugin)

  // GET /api/prime/checkUser/:userID
  .get("/checkUser/:userID", async ({ params, apiUser, requireAuth }) => {
    requireAuth();
    // Only self or first_party+ can check
    if (apiUser.id !== params.userID) {
      // requireRole checks inside route to give a proper 403
    }
    return { _stub: true, message: "Not yet ported to Elysia", userID: params.userID };
  }, {
    params: t.Object({ userID: t.String() }),
  })

  // DELETE /api/prime/:serverID — remove prime from server
  .delete("/:serverID", async ({ params, requireAuth }) => {
    requireAuth();
    return { _stub: true, message: "Not yet ported to Elysia", serverID: params.serverID };
  }, {
    params: t.Object({ serverID: t.String() }),
  });
