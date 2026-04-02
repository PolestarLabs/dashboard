/**
 * schemas/marketplace.ts — Endpoint validation schemas for /marketplace/* routes.
 */

import { t } from "elysia";
import CURRENCY_VALUES from "@definitions/constants/Currency";

export const MarketplacePostBody = t.Object({
  type:     t.Union([t.Literal("sell"), t.Literal("buy")]),
  item_id:  t.String(),
  price:    t.Number({ minimum: 1 }),
  currency: t.Union(CURRENCY_VALUES.map((c) => t.Literal(c)) as any),
});

export const MarketplacePatchBody = t.Object({
  price: t.Number({ minimum: 1 }),
});
