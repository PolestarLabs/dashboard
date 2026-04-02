/**
 * services/misc.ts — Miscellaneous utility lookups (currencies, achievements).
 * Telemetry lives in services/telemetry.ts.
 * Internal ping logic lives in services/internal.ts.
 */

import { db } from "@plugins/db";

/** Returns all Discoin-type global currency documents. */
export async function getDiscoinCurrencies() {
  return db.globals.find({ type: "discoin" }, { type: 0, _id: 0, data: 0 });
}

/**
 * Returns the achievement with the given `id`, or an empty object for the
 * special sentinel id "user".
 */
export async function getAchievement(id: string) {
  if (id === "user") return {};
  return db.achievements.get({ id });
}
