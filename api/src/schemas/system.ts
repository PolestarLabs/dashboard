/**
 * schemas/system.ts — Endpoint validation schemas for /system/* routes.
 */

import { t } from "elysia";

export const AuditLogBody = t.Object({
  type:    t.String(),
  details: t.Optional(t.Record(t.String(), t.Unknown())),
});
