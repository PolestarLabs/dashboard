/**
 * /api/system/* — System administration: blacklist management and audit logging.
 */

import Elysia from "elysia";
import { t } from "elysia";
import { authPlugin } from "@plugins/auth";
import { db } from "@plugins/db";
import { arbitraryAudit, PLATFORM_ID } from "@services/economy";

const AuditLogBody = t.Object({
  type:    t.String(),
  details: t.Optional(t.Record(t.String(), t.Unknown())),
});

export const systemRoutes = new Elysia({ prefix: "/system", tags: ["system"] })
  .use(authPlugin)

  .get("/blacklist", async ({ requireRole }) => {
    requireRole("admin");
    const users = await db.users
      .find({ blacklisted: { $exists: true, $ne: "" } })
      .lean();
    return users.map((u: Record<string, any>) => ({ id: u.id, reason: u.blacklisted }));
  })

  .get("/blacklist/:userID", async ({ params, requireRole, set }) => {
    requireRole("admin");
    const user = await db.users.get(params.userID);
    if (!user) { set.status = 404; return { error: "User not found" }; }
    return {
      userID:        params.userID,
      isBlacklisted: !!user.blacklisted && user.blacklisted !== "",
      reason:        user.blacklisted || null,
    };
  })

  .post("/blacklist/:userID", async ({ params, body, requireRole, set }) => {
    requireRole("admin");
    const user = await db.users.get(params.userID);
    if (!user) { set.status = 404; return { error: "User not found" }; }
    const reason = (body as Record<string, string>).reason ?? "Blacklisted";
    await db.users.bulkWrite([
      { updateOne: { filter: { id: params.userID }, update: { $set: { blacklisted: reason } } } },
    ]);
    return { success: true, userID: params.userID, reason };
  })

  .delete("/blacklist/:userID", async ({ params, requireRole, set }) => {
    requireRole("admin");
    const user = await db.users.get(params.userID);
    if (!user) { set.status = 404; return { error: "User not found" }; }
    await db.users.bulkWrite([
      { updateOne: { filter: { id: params.userID }, update: { $set: { blacklisted: "" } } } },
    ]);
    return { success: true, userID: params.userID };
  })

  .post("/audit", async ({ body, requireAuth, set }) => {
    const caller = requireAuth();
    const payload = await arbitraryAudit(
      caller.id,
      PLATFORM_ID,
      1,
      body.type,
      "ADM",
      "!!",
      { details: body.details ?? {} },
    );
    return { success: true, transactionId: payload.transactionId };
  }, { body: AuditLogBody });
