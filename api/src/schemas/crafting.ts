/**
 * schemas/crafting.ts — Endpoint validation schemas for /crafting/* routes.
 */

import { t } from "elysia";

export const PotItemSchema = t.Object({
  id:     t.String(),
  count:  t.Number(),
  rarity: t.Optional(t.String()),
});

export const MixBodySchema = t.Object({
  pot: t.Array(PotItemSchema),
});

export const CreateBodySchema = t.Object({
  item: t.String(),
  pot:  t.Optional(t.Array(t.Object({ id: t.String(), count: t.Number() }))),
});
