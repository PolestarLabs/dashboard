/**
 * models/fanart.ts — Elysia validation schemas for /galleries/fanart routes.
 */

import { t } from "elysia";

export const FanartIdParams = t.Object({
  id: t.String(),
});

export const FanartUpdateParams = t.Object({
  id:   t.String(),
  what: t.String(),
});

export const FanartUpdateBody = t.Object({
  value:       t.Optional(t.String()),
  title:       t.Optional(t.String()),
  description: t.Optional(t.String()),
});
