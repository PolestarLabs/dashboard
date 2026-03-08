/**
 * /api/progression/* — User XP and level progression.
 * Thin Elysia controller — no service layer yet.
 * TODO: create services/progression.ts and implement the handlers below.
 *
 * Auth model (mirrors the draft comments):
 *   GET    → user-only (self) or admin
 *   POST   → user-only (self) or admin
 *   DELETE → user-only (self) or admin
 */

import Elysia from "elysia";
import { authPlugin } from "@plugins/auth";
import { dbPlugin } from "@plugins/db";

import { UserIDParam, ProgressionUpdateBody } from "@routes/_schemas";

export const progressionRoutes = new Elysia({ prefix: "/progression", tags: ["progression"] })
  .use(authPlugin)
  .use(dbPlugin)

  // GET /progression/:userID — fetch user progression summary (user-only / admin)
  .get("/:userID", async ({ params, requireAuth, set }) => {
    requireAuth();
    // TODO: requireSelfOrAdmin(apiUser, params.userID)
    // TODO: services/progression.ts → getUserProgression(params.userID, db)
    //       → returns { level, exp, nextLevelExp, rank, ... }
    set.status = 501;
    return { message: "Not implemented" };
  }, { params: UserIDParam })

  // POST /progression/:userID — increment or set progression values (user-only / admin)
  .post("/:userID", async ({ params, body, requireAuth, set }) => {
    requireAuth();
    // TODO: requireSelfOrAdmin(apiUser, params.userID)
    // TODO: services/progression.ts → updateUserProgression(params.userID, body, db)
    set.status = 501;
    return { message: "Not implemented" };
  }, { params: UserIDParam, body: ProgressionUpdateBody })

  // DELETE /progression/:userID — reset progression to zero (user-only / admin)
  .delete("/:userID", async ({ params, requireAuth, set }) => {
    requireAuth();
    // TODO: requireSelfOrAdmin(apiUser, params.userID)
    // TODO: services/progression.ts → resetUserProgression(params.userID, db)
    set.status = 501;
    return { message: "Not implemented" };
  }, { params: UserIDParam });
