/**
 * routes/helpers.ts — Shared pure utility functions for all route modules.
 * Centralises logic that was previously duplicated across models/ and services/.
 */

import { Types as MonTypes, isValidObjectId as mongoIsValid } from "mongoose";

// ── Array utilities ──────────────────────────────────────────────────────────

/** In-place Fisher-Yates shuffle — returns a new array, never mutates the original. */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

// ── Crafting utilities ───────────────────────────────────────────────────────

/**
 * Returns true when every item in `recipe` is satisfied by the corresponding
 * item in `pot` (same id, count >= required).
 */
export function isExact(pot: any[], recipe: any[]): boolean {
  if (pot.length !== recipe.length) return false;
  return recipe.every((item: any) => {
    const mat = pot.find((m: any) => m.id === (item.id ?? item));
    if (!mat) return false;
    return mat.count >= (item.count ?? 1);
  });
}

// ── Cosmetics utilities ──────────────────────────────────────────────────────

/**
 * Enriches a sticker-pack item with its full content and material metadata.
 * Mutates `pack` in-place and returns it for chaining convenience.
 */
export async function stickerCount(pack: any, DB: any): Promise<any> {
  const [pdata, mdata] = await Promise.all([
    DB.cosmetics
      .find({ series_id: pack.icon }, { name: 1, id: 1, rarity: 1 })
      .lean(),
    DB.items
      .find(
        { id: { $in: pack?.materials?.map((x: any) => x.id ?? x) ?? [] } },
        { name: 1, id: 1, rarity: 1 },
      )
      .lean(),
  ]);
  pack.size          = pdata.length;
  pack.materialsData = mdata;
  pack.content       = pdata;
  return pack;
}

// ── MongoDB ObjectId helpers ─────────────────────────────────────────────────

/**
 * Converts a timestamp (ISO string or epoch ms) to a MongoDB ObjectId whose
 * creation time equals that timestamp. Useful for range queries via _id.
 * Note: ObjectId constructor argument is valid at runtime; cast suppresses stale @types.
 */
export function objectIdFromTimestamp(
  ts: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  const ms  = new Date(ts).getTime() || Number(ts);
  const hex = Math.floor(ms / 1000).toString(16).padStart(8, "0");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new (MonTypes.ObjectId as any)(hex + "0000000000000000");
}

/**
 * Returns true when `q` is a syntactically valid and self-consistent
 * 24-hex-character MongoDB ObjectId string.
 */
export function isValidObjectId(q: string): boolean {
  return mongoIsValid(q);
}
