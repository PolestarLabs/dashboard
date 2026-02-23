/**
 * Redis plugin — wraps ioredis and exposes a typed client on every handler.
 *
 * Used for:
 *  - Caching Discord user/guild data (cache-first strategy per blueprint)
 *  - Session-adjacent TTL caches
 */

import Elysia from "elysia";
import Redis from "ioredis";

const REDIS_HOST = process.env.REDIS_HOST ?? "127.0.0.1";
const REDIS_PORT = parseInt(process.env.REDIS_PORT ?? "6379", 10);

let _redis: Redis | null = null;

export function getRedis(): Redis {
  if (_redis) return _redis;
  _redis = new Redis({ host: REDIS_HOST, port: REDIS_PORT, lazyConnect: true });
  _redis.on("error", (err) => console.error("[Redis] Error:", err));
  _redis.on("connect", () => console.log(`[Redis] Connected to ${REDIS_HOST}:${REDIS_PORT}`));
  return _redis;
}

// Typed helpers used throughout route handlers
export const redis = {
  /** Get a cached value; returns null on miss. */
  async get<T = unknown>(key: string): Promise<T | null> {
    const raw = await getRedis().get(key);
    if (!raw) return null;
    try { return JSON.parse(raw) as T; } catch { return raw as unknown as T; }
  },

  /** Set a value with an optional TTL in seconds (default 6h). */
  async set(key: string, value: unknown, ttl = 21_600): Promise<void> {
    const serialised = typeof value === "string" ? value : JSON.stringify(value);
    await getRedis().set(key, serialised, "EX", ttl);
  },

  /** Delete one or more keys. */
  async del(...keys: string[]): Promise<void> {
    if (keys.length) await getRedis().del(...keys);
  },
};

export const redisPlugin = new Elysia({ name: "redis" })
  .decorate("redis", redis)
  .onStart(() => { getRedis(); }); // eagerly connect on boot
