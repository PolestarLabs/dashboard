/**
 * models/users.ts — Elysia validation schemas for the /user routes.
 * Single source of truth for both TypeScript types and runtime validation.
 */

import { t } from "elysia";

// ── Query / Param schemas ────────────────────────────────────────────────────

export const UserSearchQuery = t.Object({
  id:             t.Optional(t.String()),
  name:           t.Optional(t.String()),
  donator:        t.Optional(t.String()),
  personalhandle: t.Optional(t.String()),
  skip:           t.Optional(t.String()),
  lim:            t.Optional(t.String()),
});

export const HandleCheckQuery = t.Object({
  handle: t.Optional(t.String()),
});

export const UserIdParams = t.Object({
  id: t.String({ default: "88120564400553984" }),
});

export const CommendQuery = t.Object({
  full: t.Optional(t.String()),
});

export const CommendEndpointParams = t.Object({
  id:       t.String({ default: "88120564400553984" }),
  endpoint: t.String(),
});

export const FanartHeartParams = t.Object({
  operation: t.Union([t.Literal("add"), t.Literal("remove")]),
  id:        t.String(),
});
