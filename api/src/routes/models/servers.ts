/**
 * models/servers.ts — Elysia validation schemas for /server routes.
 */

import { t } from "elysia";

export const ServerIdParams = t.Object({
  id: t.String(),
});
