/**
 * DB plugin — connects Mongoose and exposes the DB collections decoreated on
 * every Elysia handler via `.use(dbPlugin)`.
 *
 * @polestar/database_schema is the shared schema package (same as Express).
 * We re-use the same models; the connection URL is driven by env vars so
 * prod/alpha environments are kept strictly isolated.
 */

import Elysia from "elysia";
// @ts-expect-error — JS package, no types yet
import initSchema from "@polestar/database_schema";

const MONGO_URL =
  process.env.MONGO_URL ??
  process.env.MONGODB_URL ??
  "mongodb://127.0.0.1:27017/pollux";

const REDIS_HOST = process.env.REDIS_HOST ?? "127.0.0.1";
const REDIS_PORT = parseInt(process.env.REDIS_PORT ?? "6379", 10);

let _db: Record<string, unknown> | null = null;

async function getDB(): Promise<Record<string, unknown>> {
  if (_db) return _db;
  _db = await initSchema(
    { url: MONGO_URL, options: { useNewUrlParser: true, useUnifiedTopology: true } },
    { redis: { host: REDIS_HOST, port: REDIS_PORT } }
  );
  console.log("[DB] Connected to MongoDB:", MONGO_URL.replace(/:\/\/[^@]*@/, "://***@"));
  return _db!;
}

export const dbPlugin = new Elysia({ name: "db" })
  .decorate("db", {} as Record<string, unknown>)
  .onStart(async ({ decorator }) => {
    decorator.db = await getDB();
  });

export { getDB };
