/**
 * models/relationships.ts — Elysia validation schemas for /relationships routes.
 */

import { t } from "elysia";

export const RelationshipQuery = t.Object({
  id:   t.Optional(t.String()),
  uid:  t.Optional(t.String()),
  page: t.Optional(t.String()),
});
