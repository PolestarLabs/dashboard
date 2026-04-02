/**
 * services/internal.ts — Service-to-service ping / cluster health logic.
 * Extracted from services/misc.ts.
 */

import { db } from "@plugins/db";
import type { ServiceResponse } from "@definitions/Misc";

/**
 * Returns the global pings document, optionally filtered to a single key.
 * Returns `{ ok: false }` when the requested filter key does not exist.
 */
export async function getPings(
  filter: string | undefined,
): Promise<ServiceResponse> {
  let pings = await db.globals.findOne({ id: 1, type: "pings" });
  if (filter) {
    pings = pings?.[filter];
    if (!pings) return { ok: false, status: 404, message: "NOT FOUND" };
  }
  return { ok: true, data: pings ?? {} };
}

/**
 * Upserts a cluster ping record. Returns `{ ok: false }` on bad input.
 */
export async function upsertPing(
  instance: string,
  cluster: string | number,
  last: string | number,
  diff: number | undefined,
): Promise<ServiceResponse> {
  if (!instance || !last) return { ok: false, status: 400, message: "ERROR" };
  await db.globals.updateOne(
    { id: 1, type: "pings" },
    {
      [instance]: {
        [`cluster_${cluster}`]: { last: new Date(Number(last)).getTime(), diff },
      },
    },
    { upsert: true },
  );
  return { ok: true };
}
