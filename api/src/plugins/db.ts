/**
 * DB + Redis singletons.
 *
 * Import { db } and { redis } directly in routes and services:
 *
 *   import { db, redis } from "@plugins/db";
 *   const user = await db.users.get(id);
 *   const cached = await redis.get<T>(key);
 *
 * Call connectDB() once during app startup (server.ts) before listening.
 */

import initSchema from "@polestarlabs/database_schema";
import type { Schemas } from "@polestarlabs/database_schema";
import Redis from "ioredis";
import { createRequire } from "module";

// ── Mongoose 5.x compat ──────────────────────────────────────────────────────
// database_schema bundles its own mongoose (5.x) which must have the legacy
// URL-parser and SDAM flags set globally, or the mongodb driver emits
// deprecation warnings.  We grab the exact mongoose instance that the package
// will use so the global set() calls are on the right module instance, and we
// guard on the major version so this is a no-op when the package upgrades to
// mongoose 6+.
(function patchBundledMongoose() {
  try {
    const _require = createRequire(import.meta.url);
    // Try the nested path first (database_schema ships its own mongoose copy).
    let _mongoose: any;
    try {
      _mongoose = _require("@polestarlabs/database_schema/node_modules/mongoose");
    } catch {
      _mongoose = _require("mongoose");
    }
    const major = parseInt((_mongoose as any).version?.split(".")[0] ?? "6", 10);
    if (major < 6) {
      _mongoose.set("useNewUrlParser",    true);
      _mongoose.set("useUnifiedTopology", true);
      _mongoose.set("useCreateIndex",     true);
      _mongoose.set("useFindAndModify",   false);
    }
  } catch {
    // Non-fatal: best-effort suppression
  }
})();

// ── Config ───────────────────────────────────────────────────────────────────

const MONGO_URL  = process.env.MONGO_URL ?? process.env.MONGODB_URL ?? process.env.DB_INFO ?? "";
const REDIS_HOST = process.env.REDIS_HOST ?? "127.0.0.1";
const REDIS_PORT = parseInt(process.env.REDIS_PORT ?? "6379", 10);

// ── MongoDB ──────────────────────────────────────────────────────────────────

let _db: Schemas | null = null;

export async function connectDB(): Promise<void> {
  const _g = globalThis as Record<string, any>;
  if (!_g.PLX) _g.PLX = {};

  // Do not pass redis to initSchema. database_schema would create its own node-redis client
  // and when Redis is down that client can block/hang and make the API unresponsive.
  // Schema query cache is disabled; auth sessions use our fail-soft redis helper below.
  _db = await initSchema(
    { url: MONGO_URL, options: { useNewUrlParser: true, useUnifiedTopology: true }, hook: undefined },
    {},
  );

  console.log("✅ [DB] Connected to MongoDB:", MONGO_URL.replace(/:\/\/[^@]*@/, "://***@"));
}

/**
 * The connected database handle. Access collections directly:
 *   db.users.get(id)
 *   db.cosmetics.find({})
 *
 * Strongly typed with the Schemas interface from @polestarlabs/database_schema.
 * Index signature allows access to properties not yet in the Schemas interface.
 */
export const db = new Proxy({} as Schemas & Record<string, any>, {
  get(_, prop: string) {
    if (!_db) throw new Error("DB not initialized — call connectDB() before using db");
    return (_db as any)[prop];
  },
});

// ── Redis ────────────────────────────────────────────────────────────────────

let _redis: Redis | null = null;
let redisDisabled = false;

function getRedisClient(): Redis {
  if (redisDisabled) {
    throw new Error("Redis disabled due to previous connection failure");
  }
  if (_redis) return _redis;
  _redis = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
  });
  _redis.on("error", (err) => console.error("[Redis] Error:", err));
  _redis.on("connect", () => console.log(`[Redis] Connected to ${REDIS_HOST}:${REDIS_PORT}`));
  return _redis;
}

export function connectRedis(): void {
  try {
    getRedisClient();
  } catch (err) {
    redisDisabled = true;
    console.error("[Redis] Disabled — failed to initialise client:", err);
  }
}

export const redis = {
  async get<T = unknown>(key: string): Promise<T | null> {
    if (redisDisabled) return null;
    try {
      const raw = await getRedisClient().get(key);
      if (!raw) return null;
      try { return JSON.parse(raw) as T; } catch { return raw as unknown as T; }
    } catch (err) {
      redisDisabled = true;
      console.error("[Redis] get() failed, disabling redis helper:", err);
      return null;
    }
  },

  async set(key: string, value: unknown, ttl = 21_600): Promise<void> {
    if (redisDisabled) return;
    try {
      const serialised = typeof value === "string" ? value : JSON.stringify(value);
      await getRedisClient().set(key, serialised, "EX", ttl);
    } catch (err) {
      redisDisabled = true;
      console.error("[Redis] set() failed, disabling redis helper:", err);
    }
  },

  async del(...keys: string[]): Promise<void> {
    if (redisDisabled || !keys.length) return;
    try {
      await getRedisClient().del(...keys);
    } catch (err) {
      redisDisabled = true;
      console.error("[Redis] del() failed, disabling redis helper:", err);
    }
  },
};

export type RedisHelper = typeof redis;

