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

const DEFAULT_MONGO = require("../../../config.js").mongodb;
const MONGO_URL =
  process.env.MONGO_URL ??
  process.env.MONGODB_URL ??
  DEFAULT_MONGO;

if (MONGO_URL === DEFAULT_MONGO) {
  console.warn("[DB] no MONGO_URL set, falling back to localhost; this may be wrong in PM2/Ecosystem environment");
}

const REDIS_HOST = process.env.REDIS_HOST ?? "127.0.0.1";
const REDIS_PORT = parseInt(process.env.REDIS_PORT ?? "6379", 10);

let _db: Record<string, unknown> | null = null;

async function getDB(): Promise<Record<string, unknown>> {
  if (_db) return _db;

  // The shared schema package refers to a global `PLX` object when
  // configuring Redis. Make sure it exists to avoid ReferenceError.
  const _g: any = globalThis;
  if (!_g.PLX) {
    _g.PLX = {};
  }

  _db = await initSchema(
    { url: MONGO_URL, options: { useNewUrlParser: true, useUnifiedTopology: true } },
    { redis: { host: REDIS_HOST, port: REDIS_PORT } }
  );
  console.log("✅ [DB] Connected to MongoDB:", MONGO_URL.replace(/:\/\/[^@]*@/, "://***@"));
  return _db!;
}

// utility to create simple class wrappers for each collection
function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// object holding generated archetype classes
export const Archetype: Record<string, any> = {};

// also export a legacy DB object for backwards compatibility
export const DB: Record<string, any> = {};

// build classes once the connection is established
function initArchetypes(db: any) {
  for (const key of Object.keys(db)) {
    const className = capitalize(key);
    class C {
      static collection = db[key];
      static get(q?: any, opts?: any) { return this.collection.get(q, opts); }
      static find(q?: any, opts?: any) { return this.collection.find(q, opts); }
      static findOne(q: any, opts?: any) { return this.collection.findOne(q, opts); }
      static new(doc: any) { return this.collection.new(doc); }
      static set(id: any, op: any) { return this.collection.set(id, op); }
      static updateOne(...args: any[]) { return this.collection.updateOne(...args); }
      static remove(q: any) { return this.collection.remove(q); }
      static bulkWrite(...args: any[]) { return this.collection.bulkWrite(...args); }
    }
    Archetype[className] = C;
    DB[key] = db[key];
  }
}

export const dbPlugin = new Elysia({ name: "db" })
  .decorate("db", {} as Record<string, unknown>)
  .onStart(async ({ decorator }) => {
    const db = await getDB();
    decorator.db = db;
    initArchetypes(db);
  });

export { getDB };

// default export for environments that import the module as a value
export default dbPlugin;
