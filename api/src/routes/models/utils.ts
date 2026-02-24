/**
 * models/utils.ts — Elysia validation schemas for /utils routes.
 */

import { t } from "elysia";

export const AchievementParams = t.Object({
  id: t.String(),
});
