/**
 * models/games.ts — Elysia validation schemas + types for /games routes.
 */

import { t } from "elysia";

export interface WordEntry {
  theme?: string;
  level?: number;
  [key: string]: unknown;
}

export const HangmaidQuery = t.Object({
  t: t.Optional(t.String()),  // theme
  l: t.Optional(t.String()),  // level
  q: t.Optional(t.String()),  // quantity
});
