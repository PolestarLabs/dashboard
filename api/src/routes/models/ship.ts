/**
 * models/ship.ts — Elysia validation schemas for /generators/ship routes.
 */

import { t } from "elysia";

export const ShipQuery = t.Object({
  av1: t.String(),
  av2: t.String(),
  spn: t.String(),
  pct: t.String(),
});
