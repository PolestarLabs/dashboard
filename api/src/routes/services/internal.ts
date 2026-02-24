/**
 * services/internal.ts — Internal ping logic, decoupled from Elysia.
 */

type DB = Record<string, any>;

export async function getPings(filter: string | undefined, db: DB) {
  let pings = await db.globals.findOne({ id: 1, type: "pings" }).lean();
  if (filter) {
    pings = pings?.[filter];
    if (!pings) return { ok: false, status: 404, message: "NOT FOUND" };
  }
  return { ok: true, data: pings ?? {} };
}

export async function upsertPing(
  instance: string,
  cluster: string | number,
  last: string | number,
  diff: number | undefined,
  db: DB,
) {
  if (!instance || !last) return { ok: false, status: 400, message: "ERROR" };
  await db.globals.updateOne(
    { id: 1, type: "pings" },
    { [instance]: { [`cluster_${cluster}`]: { last: new Date(Number(last)).getTime(), diff } } },
    { upsert: true },
  );
  return { ok: true };
}
