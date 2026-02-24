/**
 * services/utils.ts — Utility business logic, decoupled from Elysia.
 */

type DB = Record<string, any>;

export async function getDiscoinCurrencies(db: DB) {
  return db.globals.find({ type: "discoin" }, { type: 0, _id: 0, data: 0 }).lean();
}

export async function getAchievement(id: string, db: DB) {
  if (id === "user") return {};
  return db.achievements.get({ id });
}
