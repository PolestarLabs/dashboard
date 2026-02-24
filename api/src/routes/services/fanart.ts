/**
 * services/fanart.ts — Fanart gallery business logic, decoupled from Elysia.
 */

import type { DB } from "@routes/types";

export async function deleteFanart(fanartId: string, userId: string, db: DB) {
  const oldData = await db.fanart.get(fanartId);
  if (!oldData)                      return { ok: false, status: 404, message: "Not Found" };
  if (oldData.author_ID !== userId)   return { ok: false, status: 403, message: "Forbidden" };
  await db.fanart.remove({ id: fanartId });
  return { ok: true, status: 200, message: "DELETED" };
}

export async function updateFanart(
  fanartId: string,
  field: string,
  userId: string,
  body: { value?: string; title?: string; description?: string },
  db: DB,
) {
  const oldData = await db.fanart.get(fanartId);
  if (!oldData)                      return { ok: false, status: 404, message: "Not Found" };
  if (oldData.author_ID !== userId)   return { ok: false, status: 403, message: "Forbidden" };

  if (field === "twitter") {
    return { ok: true, data: await db.fanart.updateMany({ author_ID: oldData.author_ID }, { $set: { artistTwit: body.value } }) };
  }
  if (field === "link") {
    return { ok: true, data: await db.fanart.updateMany({ author_ID: oldData.author_ID }, { $set: { artistlink: body.value } }) };
  }

  const payload: Record<string, unknown> = {};
  if (body.title)       payload.title       = body.title;
  if (body.description) payload.description = body.description;
  return { ok: true, data: await db.fanart.set({ id: fanartId }, { $set: payload }) };
}
