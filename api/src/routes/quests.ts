/**
 * /api/* — Quest definitions and per-user quest progression.
 * Thin Elysia controller — no service layer yet.
 */

import Elysia from "elysia";
import { authPlugin } from "@plugins/auth";

export const questsRoutes = new Elysia({ prefix: "/", tags: ["quests", "progression"] })
  .use(authPlugin)

  .get("/quests/:questGenericID", async ({ params, requireAuth, set }) => {
    requireAuth();
    set.status = 501;
    return { message: "Not implemented" };
  })

  .get("/user/:userID/quests", async ({ params, requireAuth, set }) => {
    requireAuth();
    set.status = 501;
    return { message: "Not implemented" };
  })

  .patch("/user/:userID/quests", async ({ params, body, requireAuth, set }) => {
    requireAuth();
    set.status = 501;
    return { message: "Not implemented" };
  })

  .post("/user/:userID/quests/:questGenericID", async ({ params, requireAuth, set }) => {
    requireAuth();
    set.status = 501;
    return { message: "Not implemented" };
  })

  .get("/user/:userID/quests/:questUniqID", async ({ params, requireAuth, set }) => {
    requireAuth();
    set.status = 501;
    return { message: "Not implemented" };
  })

  .patch("/user/:userID/quests/:questUniqID", async ({ params, body, requireAuth, set }) => {
    requireAuth();
    set.status = 501;
    return { message: "Not implemented" };
  })

  .put("/user/:userID/quests/:questUniqID", async ({ params, body, requireAuth, set }) => {
    requireAuth();
    set.status = 501;
    return { message: "Not implemented" };
  })

  .delete("/user/:userID/quests/:questUniqID", async ({ params, requireAuth, set }) => {
    requireAuth();
    set.status = 501;
    return { message: "Not implemented" };
  })

  .post("/user/:userID/quests/resolve/:questUniqID", async ({ params, requireAuth, set }) => {
    requireAuth();
    set.status = 501;
    return { message: "Not implemented" };
  });
