/**
 * /api/system/* — System administration: blacklist management and audit logging.
 * Thin Elysia controller.
 *
 * Blacklist delegates to db.users directly (the `blacklisted` field on the
 * user document is a non-empty string when active, or "" / absent when clear).
 *
 * Audit logging delegates to arbitraryAudit() from services/economy, which
 * writes an out-of-band entry to db.audits without moving any balance.
 *
 * Auth model:
 *   All /blacklist/* routes → admin-only (requireRole("admin"))
 *   POST /audit             → app-authed (requireAuth)
 */

import Elysia from "elysia";
import { authPlugin } from "@plugins/auth";
import { dbPlugin } from "@plugins/db";
import type { DB } from "@routes/types";

import { UserIDParam, BlacklistPostBody, AuditLogBody } from "@routes/_schemas";
import { arbitraryAudit, PLATFORM_ID } from "@services/economy";

export const systemRoutes = new Elysia({ prefix: "/system", tags: ["system"] })
  .use(authPlugin)
  .use(dbPlugin)

  // GET /system/blacklist — list all currently blacklisted users (admin-only)
  .get("/blacklist", async ({ requireRole, db }) => {
    requireRole("admin");
    const users = await (db as DB).users
      .find({ blacklisted: { $exists: true, $ne: "" } })
      .lean();
    return users.map((u: Record<string, any>) => ({ id: u.id, reason: u.blacklisted }));
  })

  // GET /system/blacklist/:userID — check whether a specific user is blacklisted (admin-only)
  .get("/blacklist/:userID", async ({ params, requireRole, db, set }) => {
    requireRole("admin");
    const user = await (db as DB).users.get(params.userID);
    if (!user) { set.status = 404; return { error: "User not found" }; }
    return {
      userID:        params.userID,
      isBlacklisted: !!user.blacklisted && user.blacklisted !== "",
      reason:        user.blacklisted || null,
    };
  }, { params: UserIDParam })

  // POST /system/blacklist/:userID — add or update a user's blacklist entry (admin-only)
  .post("/blacklist/:userID", async ({ params, body, requireRole, db, set }) => {
    requireRole("admin");
    const user = await (db as DB).users.get(params.userID);
    if (!user) { set.status = 404; return { error: "User not found" }; }
    const reason = body.reason ?? "Blacklisted";
    await (db as DB).users.bulkWrite([
      { updateOne: { filter: { id: params.userID }, update: { $set: { blacklisted: reason } } } },
    ]);
    return { success: true, userID: params.userID, reason };
  }, { params: UserIDParam, body: BlacklistPostBody })

  // DELETE /system/blacklist/:userID — lift a user's blacklist entry (admin-only)
  .delete("/blacklist/:userID", async ({ params, requireRole, db, set }) => {
    requireRole("admin");
    const user = await (db as DB).users.get(params.userID);
    if (!user) { set.status = 404; return { error: "User not found" }; }
    await (db as DB).users.bulkWrite([
      { updateOne: { filter: { id: params.userID }, update: { $set: { blacklisted: "" } } } },
    ]);
    return { success: true, userID: params.userID };
  }, { params: UserIDParam })

  // POST /system/audit — record an arbitrary audit event (app-authed)
  // Uses arbitraryAudit() which writes to db.audits without touching any balance.
  .post("/audit", async ({ body, requireAuth, db, set }) => {
    const caller = requireAuth();
    const payload = await arbitraryAudit(
      caller.id,
      PLATFORM_ID,
      1,
      body.type,
      "ADM",
      "!!",
      db as DB,
      { details: body.details ?? {} },
    );
    return { success: true, transactionId: payload.transactionId };
  }, { body: AuditLogBody });
