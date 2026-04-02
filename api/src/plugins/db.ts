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

// ── Config ───────────────────────────────────────────────────────────────────

const MONGO_URL  = process.env.MONGO_URL ?? process.env.MONGODB_URL ?? "";
const REDIS_HOST = process.env.REDIS_HOST ?? "127.0.0.1";
const REDIS_PORT = parseInt(process.env.REDIS_PORT ?? "6379", 10);

// ── MongoDB ──────────────────────────────────────────────────────────────────

let _db: Schemas | null = null;

export async function connectDB(): Promise<void> {
  const _g = globalThis as Record<string, any>;
  if (!_g.PLX) _g.PLX = {};

  _db = await initSchema(
    { url: MONGO_URL, options: { useNewUrlParser: true, useUnifiedTopology: true }, hook: undefined },
    { redis: { host: REDIS_HOST, port: REDIS_PORT } },
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

function getRedisClient(): Redis {
  if (_redis) return _redis;
  _redis = new Redis({ host: REDIS_HOST, port: REDIS_PORT, lazyConnect: true });
  _redis.on("error", (err) => console.error("[Redis] Error:", err));
  _redis.on("connect", () => console.log(`[Redis] Connected to ${REDIS_HOST}:${REDIS_PORT}`));
  return _redis;
}

export function connectRedis(): void {
  getRedisClient();
}

export const redis = {
  async get<T = unknown>(key: string): Promise<T | null> {
    const raw = await getRedisClient().get(key);
    if (!raw) return null;
    try { return JSON.parse(raw) as T; } catch { return raw as unknown as T; }
  },

  async set(key: string, value: unknown, ttl = 21_600): Promise<void> {
    const serialised = typeof value === "string" ? value : JSON.stringify(value);
    await getRedisClient().set(key, serialised, "EX", ttl);
  },

  async del(...keys: string[]): Promise<void> {
    if (keys.length) await getRedisClient().del(...keys);
  },
};

export type RedisHelper = typeof redis;

