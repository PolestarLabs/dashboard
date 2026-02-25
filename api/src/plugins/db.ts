/**
 * DB plugin — connects Mongoose and exposes the DB collections decoreated on
 * every Elysia handler via `.use(dbPlugin)`.
 *
 * @polestar/database_schema is the shared schema package (same as Express).
 * We re-use the same models; the connection URL is driven by env vars so
 * prod/alpha environments are kept strictly isolated.
 */

import { Elysia } from "elysia";
import initSchema from "@polestar/database_schema";
import { Schemas } from "@polestar/database_schema";


const MONGO_URL =
  process.env.MONGO_URL ??
  process.env.MONGODB_URL ?? ""



const REDIS_HOST = process.env.REDIS_HOST ?? "127.0.0.1";
const REDIS_PORT = parseInt(process.env.REDIS_PORT ?? "6379", 10);

let _db: Schemas;

async function getDB(): Promise<Schemas> {
  if (_db) return _db;

  // The shared schema package refers to a global `PLX` object when
  // configuring Redis. Make sure it exists to avoid ReferenceError.
  const _g: any = globalThis;
  if (!_g.PLX) {
    _g.PLX = {};
  }

  _db = await initSchema(
    {
        url: MONGO_URL, options: { useNewUrlParser: true, useUnifiedTopology: true },
        hook: undefined, // disable default hooks which log to console; we'll handle logging in the plugin lifecycle
    },
    { redis: { host: REDIS_HOST, port: REDIS_PORT } }
  );
  console.log("✅ [DB] Connected to MongoDB:", MONGO_URL!.replace(/:\/\/[^@]*@/, "://***@"));
  return _db!;
}

export const dbPlugin = new Elysia({ name: "db" })
  .decorate("db", {} as Schemas)
  .onStart(async ({ decorator }: { decorator: Record<string, any> }) => {
    const db = await getDB();
    decorator.db = db;
  });

export { getDB };

export default dbPlugin;
