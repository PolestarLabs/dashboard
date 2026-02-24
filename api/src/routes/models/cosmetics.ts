/**
 * models/cosmetics.ts — Elysia validation schemas + shared types for /cosmetics routes.
 */

import { t } from "elysia";

// ── Interfaces ───────────────────────────────────────────────────────────────

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

// ── Validation schemas ───────────────────────────────────────────────────────

export const CosmeticSearchQuery = t.Object({
  id:      t.Optional(t.String()),
  rarity:  t.Optional(t.String()),
  code:    t.Optional(t.String()),
  event:   t.Optional(t.String()),
  icon:    t.Optional(t.String()),
  type:    t.Optional(t.String()),
  expires: t.Optional(t.String()),
  filter:  t.Optional(t.String()),
  name:    t.Optional(t.String()),
  before:  t.Optional(t.String()),
  after:   t.Optional(t.String()),
  searchq: t.Optional(t.String()),
  skip:    t.Optional(t.String()),
  lim:     t.Optional(t.String()),
  all:     t.Optional(t.String()),
  public:  t.Optional(t.String()),
});

export const CosmeticIdParams = t.Object({
  id: t.String(),
});

export const CosmeticCountParams = t.Object({
  type: t.String(),
});

export const CosmeticCountQuery = t.Object({
  event:  t.Optional(t.String()),
  rarity: t.Optional(t.String()),
});

export const CosmeticGenericParams = t.Object({
  other: t.String(),
  id:    t.String(),
});
