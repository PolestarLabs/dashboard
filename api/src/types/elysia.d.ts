/**
 * types/elysia.d.ts — Global Elysia context type aliases.
 *
 * Use these in route handlers instead of crafting per-file interfaces:
 *
 *   import type { DbContext, AuthContext } from "@types/elysia";
 *   .get("/foo", ({ params, db }: DbContext) => { ... })
 *   .get("/bar", ({ requireAuth, db }: AuthContext) => { ... })
 *
 * Types are derived via Elysia's `InferContext` utility directly from the
 * plugin instances, so they stay in sync automatically when plugins change.
 */

import type { InferContext } from "elysia";
import type { dbPlugin } from "../plugins/db";
import type { redisPlugin } from "../plugins/redis";
import type { authPlugin } from "../plugins/auth";

// ── Auth domain types (re-exported for convenience) ──────────────────────────

export type { ApiUser, ApiPermission } from "../plugins/auth";

// ── Context aliases ───────────────────────────────────────────────────────────

/**
 * Context for routes wired to `dbPlugin`.
 * Decorated: `db` (`Schemas` from @polestarlabs/database_schema).
 */
export type DbContext = InferContext<typeof dbPlugin>;

/**
 * Context for routes wired to `redisPlugin`.
 * Decorated: `redis` (typed helper — get / set / del).
 */
export type RedisContext = InferContext<typeof redisPlugin>;

/**
 * Context for routes wired to `authPlugin` (which already includes dbPlugin).
 * Decorated:  `db`, `bearer`
 * Derived:    `apiUser`, `requireAuth()`, `requireRole(min)`
 */
export type AuthContext = InferContext<typeof authPlugin>;
