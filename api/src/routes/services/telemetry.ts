/**
 * services/telemetry.ts — Bot/dashboard telemetry business logic.
 * Extracted from services/misc.ts.
 */

import type { DB } from "@routes/types";

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
