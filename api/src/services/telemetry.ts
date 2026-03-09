/**
 * services/telemetry.ts — Bot/dashboard telemetry business logic.
 * Extracted from services/misc.ts.
 */

import { db } from "@plugins/db";

/**
 * Records a theme switch for `userId` and increments the click counter
 * for that theme id.
 */
export async function saveTheme(themeId: string, userId: string) {
  await db.users.set(userId, {
    $set: { "switches.dashTheme": themeId },
    $inc: { [`counters.dashThemeClicks.${themeId}`]: 1 },
  });
}
