/**
 * /api/games/adventure/* — Adventure game: locations, encounters, and journals.
 * Thin Elysia controller — no service layer yet.
 */

import Elysia from "elysia";
import { authPlugin } from "@plugins/auth";

export const adventureRoutes = new Elysia({ prefix: "/games/adventure", tags: ["games", "adventure"] })
  .use(authPlugin)

  .get("/locations/:locationID", async ({ params, set }) => {
    set.status = 501;
    return { message: "Not implemented" };
  })

  .get("/locations/:locationID/routes", async ({ params, set }) => {
    set.status = 501;
    return { message: "Not implemented" };
  })

  .get("/locations/:locationID/occupancy", async ({ params, set }) => {
    set.status = 501;
    return { message: "Not implemented" };
  })

  .get("/encounters/:encounterID", async ({ params, set }) => {
    set.status = 501;
    return { message: "Not implemented" };
  })

  .get("/journals/:userID", async ({ params, requireAuth, set }) => {
    requireAuth();
    set.status = 501;
    return { message: "Not implemented" };
  })

  .get("/journals/:userID/:entryID", async ({ params, requireAuth, set }) => {
    requireAuth();
    set.status = 501;
    return { message: "Not implemented" };
  });
