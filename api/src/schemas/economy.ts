/**
 * schemas/economy.ts — Endpoint validation schemas for /economy/* routes.
 */

import { t } from "elysia";

export const CurrencyOpBody = t.Object({
  userID:   t.String(),
  amount:   t.Number({ minimum: 1 }),
  type:     t.Optional(t.String()),
  currency: t.Optional(t.String()),
});

export const TransferBody = t.Object({
  from:     t.String(),
  to:       t.String(),
  amount:   t.Number({ minimum: 1 }),
  type:     t.Optional(t.String()),
  currency: t.Optional(t.String()),
});
