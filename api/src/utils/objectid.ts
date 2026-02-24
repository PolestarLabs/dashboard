/**
 * utils/objectid.ts — MongoDB ObjectId utility helpers.
 */

import { Types as MonTypes, isValidObjectId as mongoIsValid } from "mongoose";

/**
 * Converts a timestamp (ISO string or epoch ms) to a MongoDB ObjectId whose
 * creation time equals that timestamp. Useful for range queries via _id.
 */
export function objectIdFromTimestamp(ts: string): any {
  const ms = new Date(ts).getTime() || Number(ts);
  const hex = Math.floor(ms / 1000).toString(16).padStart(8, "0");
  return new (MonTypes.ObjectId as any)(hex + "0000000000000000");
}

/**
 * Returns true when `q` is a syntactically valid and self-consistent
 * 24-hex-character MongoDB ObjectId string.
 */
export function isValidObjectId(q: string): boolean {
  return mongoIsValid(q);
}
