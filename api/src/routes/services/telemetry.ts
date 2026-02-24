/**
 * services/telemetry.ts — Telemetry logic, decoupled from Elysia.
 */

type DB = Record<string, any>;

export async function saveTheme(
  themeId: string,
  userId: string,
  db: DB,
) {
  await db.users.set(userId, {
    $set:  { "switches.dashTheme": themeId },
    $inc:  { [`counters.dashThemeClicks.${themeId}`]: 1 },
  });
}
