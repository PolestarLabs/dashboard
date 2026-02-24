/**
 * services/misc.ts — Miscellaneous business logic merged from:
 *   services/telemetry.ts  (saveTheme)
 *   services/utils.ts      (getDiscoinCurrencies, getAchievement)
 *   services/internal.ts   (getPings, upsertPing)
 *
 * Functions are grouped by their originating domain for readability.
 */

import type { DB } from "@routes/types";

// ── Telemetry ────────────────────────────────────────────────────────────────

/**
 * Records a theme switch for `userId` and increments the click counter
 * for that theme id.
 */
export async function saveTheme(themeId: string, userId: string, db: DB) {
  await db.users.set(userId, {
    $set: { "switches.dashTheme": themeId },
    $inc: { [`counters.dashThemeClicks.${themeId}`]: 1 },
  });
}

// ── Utils ────────────────────────────────────────────────────────────────────

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

// ── Internal pings ───────────────────────────────────────────────────────────

/**
 * Returns the global pings document, optionally filtered to a single key.
 * Returns `{ ok: false }` when the requested filter key does not exist.
 */
export async function getPings(
  filter: string | undefined,
  db: DB,
): Promise<{ ok: boolean; status?: number; message?: string; data?: unknown }> {
  let pings = await db.globals.findOne({ id: 1, type: "pings" }).lean();
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
  db: DB,
): Promise<{ ok: boolean; status?: number; message?: string }> {
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
