/**
 * /api/marketplace/* — marketplace listings (buy/sell/post/cancel/edit).
 * Thin Elysia controller — delegates all business logic to services/marketplace.
 */

import Elysia from "elysia";
import { t } from "elysia";
import { authPlugin } from "@plugins/auth";
import CURRENCY_VALUES from "@definitions/constants/Currency";

import {
  getMarketplaceListings,
  getItemMarketDetails,
  postListing,
  buyFromListing,
  sellToListing,
  deleteListing,
  editListingPrice,
} from "@services/marketplace";

import type { Currency } from "@definitions/Currency";

const MarketplacePostBody = t.Object({
  type:     t.Union([t.Literal("sell"), t.Literal("buy")]),
  item_id:  t.String(),
  price:    t.Number({ minimum: 1 }),
  currency: t.Union(CURRENCY_VALUES.map((c) => t.Literal(c)) as any),
});

const MarketplacePatchBody = t.Object({
  price: t.Number({ minimum: 1 }),
});

export const marketplaceRoutes = new Elysia({ prefix: "/marketplace", tags: ["marketplace"] })
  .use(authPlugin)

  .get("/", ({ query }) =>
    getMarketplaceListings(query as Record<string, string | undefined>))

  .get("/item/:item", async ({ params, set }) => {
    const details = await getItemMarketDetails(params.item);
    if (!details) { set.status = 404; return { message: "Item not found" }; }
    return details;
  })

  .post("/", async ({ body, requireAuth, set }) => {
    const user = requireAuth();
    const payload = {
      ...body,
      author:   user.id,
      currency: body.currency as Currency,
    };
    const result = await postListing(payload);
    if (!result.ok) { set.status = result.status; return { message: result.message }; }
    return { status: "OK", entry: result.entry };
  }, { body: MarketplacePostBody })

  .post("/buy/:entry_id", async ({ params, requireAuth, set }) => {
    const user   = requireAuth();
    const result = await buyFromListing(params.entry_id, user);
    if (!result.ok) { set.status = result.status; return { message: result.message }; }
    return { status: "OK", receipt: result.receipt };
  })

  .post("/sell/:entry_id", async ({ params, requireAuth, set }) => {
    const user   = requireAuth();
    const result = await sellToListing(params.entry_id, user);
    if (!result.ok) { set.status = result.status; return { message: result.message }; }
    return { status: "OK", receipt: result.receipt };
  })

  .delete("/:entry_id", async ({ params, requireAuth, set }) => {
    const user   = requireAuth();
    const result = await deleteListing(params.entry_id, user.id);
    if (!result.ok) { set.status = result.status; return { message: result.message }; }
    return { status: "OK" };
  })

  .patch("/:entry_id", async ({ params, body, requireAuth, set }) => {
    const user   = requireAuth();
    const result = await editListingPrice(params.entry_id, user.id, body.price);
    if (!result.ok) { set.status = result.status; return { message: result.message }; }
    return { status: "OK" };
  }, { body: MarketplacePatchBody });


