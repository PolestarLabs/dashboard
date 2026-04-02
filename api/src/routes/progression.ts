/**
 * /api/progression/* — User XP and level progression.
 * Thin Elysia controller — no service layer yet.
 */

import Elysia from "elysia";
import { authPlugin } from "@plugins/auth";

export const progressionRoutes = new Elysia({ prefix: "/progression", tags: ["progression"] })
  .use(authPlugin)

  .get("/:userID", async ({ params, requireAuth, set }) => {
    requireAuth();
    set.status = 501;
    return { message: "Not implemented" };
  })

  .post("/:userID", async ({ params, body, requireAuth, set }) => {
    requireAuth();
    set.status = 501;
    return { message: "Not implemented" };
  })

  .delete("/:userID", async ({ params, requireAuth, set }) => {
    requireAuth();
    set.status = 501;
    return { message: "Not implemented" };
  });
