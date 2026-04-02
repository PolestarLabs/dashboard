/**
 * services/fanart.ts — Fanart gallery business logic, decoupled from Elysia.
 */

import { db } from "@plugins/db";
import type { ServiceResponse } from "@definitions/Misc";

// ── Fanart Hearts ────────────────────────────────────────────────────────────────

export async function toggleFanartHeart(
  userId: string,
  fanartId: string,
  operation: "add" | "remove",
  _db = db,
): Promise<ServiceResponse> {
  const fana = await _db.collections.fanart.findOne({ id: fanartId });
  if (!fana) return { ok: false, status: 404, message: "Not Found" };

  if (operation === "add") {
    await Promise.all([
      _db.users.set(userId, { $addToSet: { "counters.hearts": fanartId } }),
      _db.collections.fanart.updateOne({ id: fanartId }, { $inc: { hearts: 1 } }),
    ]);
  } else {
    await Promise.all([
      _db.users.set(userId, { $pull: { "counters.hearts": fanartId } }),
      _db.collections.fanart.updateOne({ id: fanartId }, { $inc: { hearts: -1 } }),
    ]);
  }
  return { ok: true, status: 200, message: "OK" };
}

// ── CRUD ─────────────────────────────────────────────────────────────────────

export async function deleteFanart(fanartId: string, userId: string, _db = db) {
  const oldData = await _db.fanart.get(fanartId);
  if (!oldData)                      return { ok: false, status: 404, message: "Not Found" };
  if (oldData.author_ID !== userId)   return { ok: false, status: 403, message: "Forbidden" };
  await _db.fanart.remove({ id: fanartId });
  return { ok: true, status: 200, message: "DELETED" };
}

export async function updateFanart(
  fanartId: string,
  field: string,
  userId: string,
  body: { value?: string; title?: string; description?: string },
  _db = db,
) {
  const oldData = await _db.fanart.get(fanartId);
  if (!oldData)                      return { ok: false, status: 404, message: "Not Found" };
  if (oldData.author_ID !== userId)   return { ok: false, status: 403, message: "Forbidden" };

  if (field === "twitter") {
    return { ok: true, data: await _db.fanart.updateMany({ author_ID: oldData.author_ID }, { $set: { artistTwit: body.value } }) };
  }
  if (field === "link") {
    return { ok: true, data: await _db.fanart.updateMany({ author_ID: oldData.author_ID }, { $set: { artistlink: body.value } }) };
  }

  const payload: Record<string, unknown> = {};
  if (body.title)       payload.title       = body.title;
  if (body.description) payload.description = body.description;
  return { ok: true, data: await _db.fanart.set({ id: fanartId }, { $set: payload }) };
}
