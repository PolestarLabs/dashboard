/**
 * /api/* — Quest definitions and per-user quest progression.
 * Thin Elysia controller — no service layer yet.
 * TODO: create services/quests.ts and implement the handlers below.
 *
 * Auth model:
 *   GET quest definitions    → app-authed (requireAuth)
 *   GET/PATCH user data      → user-only (self) or admin (requireRole)
 *   POST/PUT/DELETE/resolve  → app-authed (requireAuth)
 */

import Elysia from "elysia";
import { authPlugin } from "@plugins/auth";
import { dbPlugin } from "@plugins/db";

import {
  QuestGenericIdParams,
  UserIDParam,
  UserQuestAssignParams,
  UserQuestUniqParams,
  QuestsBulkUpdateBody,
  QuestUpdateBody,
} from "@routes/_schemas";

export const questsRoutes = new Elysia({ prefix: "/", tags: ["quests", "progression"] })
  .use(authPlugin)
  .use(dbPlugin)

  // ── Quest definitions ──────────────────────────────────────────────────────

  // GET /quests/:questGenericID — fetch the shared quest template (app-authed)
  .get("/quests/:questGenericID", async ({ params, requireAuth, set }) => {
    requireAuth();
    // TODO: services/quests.ts → getQuestDefinition(params.questGenericID, db)
    set.status = 501;
    return { message: "Not implemented" };
  }, { params: QuestGenericIdParams })

  // ── User quest instances ───────────────────────────────────────────────────

  // GET /user/:userID/quests — all quest instances + progression (user-only / admin)
  .get("/user/:userID/quests", async ({ params, requireAuth, set }) => {
    requireAuth();
    // TODO: requireSelfOrAdmin(apiUser, params.userID)
    // TODO: services/quests.ts → getUserQuests(params.userID, db)
    set.status = 501;
    return { message: "Not implemented" };
  }, { params: UserIDParam })

  // PATCH /user/:userID/quests — bulk update all quest progressions (app-authed)
  .patch("/user/:userID/quests", async ({ params, body, requireAuth, set }) => {
    requireAuth();
    // TODO: services/quests.ts → bulkUpdateUserQuests(params.userID, body.quests, db)
    set.status = 501;
    return { message: "Not implemented" };
  }, { params: UserIDParam, body: QuestsBulkUpdateBody })

  // POST /user/:userID/quests/:questGenericID — assign a quest instance to user (app-authed)
  .post("/user/:userID/quests/:questGenericID", async ({ params, requireAuth, set }) => {
    requireAuth();
    // TODO: services/quests.ts → assignQuestToUser(params.userID, params.questGenericID, db)
    //       → creates a new unique quest ID for this instance
    set.status = 501;
    return { message: "Not implemented" };
  }, { params: UserQuestAssignParams })

  // GET /user/:userID/quests/:questUniqID — get specific quest instance (user-only / admin)
  .get("/user/:userID/quests/:questUniqID", async ({ params, requireAuth, set }) => {
    requireAuth();
    // TODO: requireSelfOrAdmin(apiUser, params.userID)
    // TODO: services/quests.ts → getUserQuest(params.userID, params.questUniqID, db)
    set.status = 501;
    return { message: "Not implemented" };
  }, { params: UserQuestUniqParams })

  // NOTE: the following alias was causing a parameter name collision with
  //       the `/quests/:questGenericID` route registered earlier. Elysia does
  //       not allow two routes at the same path with different param names, so
  //       we drop the alias and rely on the user‑scoped path above instead.
  // GET /quests/:userID/:questUniqID — (removed alias)

  // PATCH /user/:userID/quests/:questUniqID — partial update of quest progression (app-authed)
  .patch("/user/:userID/quests/:questUniqID", async ({ params, body, requireAuth, set }) => {
    requireAuth();
    // TODO: services/quests.ts → patchUserQuest(params.userID, params.questUniqID, body, db)
    set.status = 501;
    return { message: "Not implemented" };
  }, { params: UserQuestUniqParams, body: QuestUpdateBody })

  // PUT /user/:userID/quests/:questUniqID — full override of quest progression (app-authed)
  .put("/user/:userID/quests/:questUniqID", async ({ params, body, requireAuth, set }) => {
    requireAuth();
    // TODO: services/quests.ts → overrideUserQuest(params.userID, params.questUniqID, body, db)
    set.status = 501;
    return { message: "Not implemented" };
  }, { params: UserQuestUniqParams, body: QuestUpdateBody })

  // DELETE /user/:userID/quests/:questUniqID — delete a quest instance (app-authed)
  .delete("/user/:userID/quests/:questUniqID", async ({ params, requireAuth, set }) => {
    requireAuth();
    // TODO: services/quests.ts → deleteUserQuest(params.userID, params.questUniqID, db)
    set.status = 501;
    return { message: "Not implemented" };
  }, { params: UserQuestUniqParams })

  // POST /user/:userID/quests/resolve/:questUniqID — check completion and claim rewards (app-authed)
  // questUniqID may be the literal string 'all' to resolve every pending quest at once.
  .post("/user/:userID/quests/resolve/:questUniqID", async ({ params, requireAuth, set }) => {
    requireAuth();
    // TODO: services/quests.ts → resolveUserQuest(params.userID, params.questUniqID, db)
    //       → returns reward payload on success
    set.status = 501;
    return { message: "Not implemented" };
  }, { params: UserQuestUniqParams });
