/**
 * models/internal.ts — Elysia validation schemas for /internal routes.
 */

import { t } from "elysia";

export const PingFilterQuery = t.Object({
  filter: t.Optional(t.String()),
});

export const PingBody = t.Object({
  instance: t.String(),
  cluster:  t.Union([t.String(), t.Number()]),
  last:     t.Union([t.String(), t.Number()]),
  diff:     t.Optional(t.Number()),
});
