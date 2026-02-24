/**
 * routes/types.ts — Shared TypeScript types for all route modules.
 * Import from here instead of declaring locally in each file.
 */

// ── Database handle ──────────────────────────────────────────────────────────

/** Generic typed reference to the decorated `db` context property. */
export type DB = Record<string, any>;

// ── Generic service result ───────────────────────────────────────────────────

/**
 * Discriminated union returned by service functions.
 * Controllers unpack this and map to HTTP status codes.
 */
export type ServiceResult<T = unknown> =
  | { ok: true; data: T }
  | { ok: false; status: number; message: string };

// ── Domain interfaces ────────────────────────────────────────────────────────

/** Shape of a raw cosmetic document returned from MongoDB. */
export interface CosmeticDoc {
  _id: { toString(): string };
  id: string;
  code?: string;
  icon?: string;
  rarity?: string;
  tags?: string;
  artistName?: string;
  artistLink?: string;
  type?: string;
  GROUP?: unknown;
  BUNDLE?: unknown;
  tradeable?: boolean;
  droppable?: boolean;
  destroyable?: boolean;
  event?: string | false;
  series_id?: string;
  public?: boolean;
}

/** Shape of a word entry used by the Hangmaid minigame service. */
export interface WordEntry {
  theme?: string;
  level?: number;
  [key: string]: unknown;
}
