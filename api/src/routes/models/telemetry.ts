/**
 * models/telemetry.ts — Elysia validation schemas for /telemetry routes.
 */

import { t } from "elysia";

export const ThemeParams = t.Object({
  id: t.String(),
});

export const ThemeQuery = t.Object({
  user: t.Optional(t.String()),
});
