/**
 * services/misc.ts — Miscellaneous utility lookups (currencies, achievements).
 * Telemetry lives in services/telemetry.ts.
 * Internal ping logic lives in services/internal.ts.
 */

import type { DB } from "@routes/types";

/** Returns all Discoin-type global currency documents. */
export async function getDiscoinCurrencies(db: DB) {
  return db.globals.find({ type: "discoin" }, { type: 0, _id: 0, data: 0 }).lean();
}

/**
 * Returns the achievement with the given `id`, or an empty object for the
 * special sentinel id "user".
 */
export async function getAchievement(id: string, db: DB) {
  if (id === "user") return {};
  return db.achievements.get({ id });
}
