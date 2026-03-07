/**
 * /api/marketplace/* — marketplace listings (buy/sell/post/cancel/edit).
 * Thin Elysia controller — delegates all business logic to services/marketplace.
 *
 * Auth model:
 *   - GET endpoints are open (public catalogue).
 *   - All mutation endpoints require a valid API token (requireAuth()).
 */

import Elysia, { status } from "elysia";

import { dbPlugin }   from "@plugins/db";
import { redisPlugin } from "@plugins/redis";
import { authPlugin }  from "@plugins/auth";

import {
  MarketplaceListQuery,
  MarketplaceEntryParams,
  MarketplaceItemParams,
  MarketplacePostBody,
  MarketplacePatchBody,
} from "@routes/schemas";

import {
  getMarketplaceListings,
  getItemMarketDetails,
  postListing,
  buyFromListing,
  sellToListing,
  deleteListing,
  editListingPrice,
} from "@services/marketplace";

import type { MarketplacePostBodyType } from "@routes/schemas";
import type { Currency } from "@definitions/Currency";

export const marketplaceRoutes = new Elysia({ prefix: "/marketplace", tags: ["marketplace"] })
  .use(dbPlugin)
  .use(redisPlugin)
  .use(authPlugin)


/// GET ==>

  // ── GET /marketplace ───────────────────────────────────────────────────────
  // List / filter active listings. Open endpoint.
  .get("/", ({ query, redis, db }) =>
    getMarketplaceListings(query as any, redis, db),
  { query: MarketplaceListQuery })

  // ── GET /marketplace/item/:item ────────────────────────────────────────────
  // Item price stats and active entries. Open endpoint.
  .get("/item/:item", async ({ params, db, set }) => {
    const details = await getItemMarketDetails(params.item, db);
    if (!details) { set.status = 404; return { message: "Item not found" }; }
    return details;
  }, { params: MarketplaceItemParams })


// POST

  // ── POST /marketplace ──────────────────────────────────────────────────────
  // Post a new buy or sell listing. Requires auth.
  .post("/", async ({ body, requireAuth, db, redis, set }) => {
    const user = requireAuth();
    const payload = {
      ...(body as MarketplacePostBodyType),
      author:   user.id,
      currency: (body as MarketplacePostBodyType).currency as Currency,
    };
    const result = await postListing(payload, redis, db);
    if (!result.ok) { set.status = result.status; return { message: result.message }; }
    return { status: "OK", entry: result.entry };
  }, { body: MarketplacePostBody })

  // ── POST /marketplace/buy/:entry_id ───────────────────────────────────────
  // Purchase an item from a "sell" listing. Requires auth.
  .post("/buy/:entry_id", async ({ params, requireAuth, db, set }) => {
    const user   = requireAuth();
    const result = await buyFromListing(params.entry_id, user, db);
    if (!result.ok) { set.status = result.status; return { message: result.message }; }
    return { status: "OK", receipt: result.receipt };
  }, { params: MarketplaceEntryParams })

  // ── POST /marketplace/sell/:entry_id ──────────────────────────────────────
  // Fulfill a "buy" listing (sell your item to the poster). Requires auth.
  .post("/sell/:entry_id", async ({ params, requireAuth, db, set }) => {
    const user   = requireAuth();
    const result = await sellToListing(params.entry_id, user, db);
    if (!result.ok) { set.status = result.status; return { message: result.message }; }
    return { status: "OK", receipt: result.receipt };
  }, { params: MarketplaceEntryParams })


//DELETE and PATCH ==>

  // ── DELETE /marketplace/:entry_id ─────────────────────────────────────────
  // Cancel a listing and restore the item to the author. Requires auth (owner only).
  .delete("/:entry_id", async ({ params, requireAuth, db, set }) => {
    const user   = requireAuth();
    const result = await deleteListing(params.entry_id, user.id, db);
    if (!result.ok) { set.status = result.status; return { message: result.message }; }
    return { status: "OK" };
  }, { params: MarketplaceEntryParams })


  // ── PATCH /marketplace/:entry_id ──────────────────────────────────────────
  // Edit listing price. Requires auth (owner only).
  .patch("/:entry_id", async ({ params, body, requireAuth, db, set }) => {
    const user   = requireAuth();
    const result = await editListingPrice(params.entry_id, user.id, (body as { price: number }).price, db);
    if (!result.ok) { set.status = result.status; return { message: result.message }; }
    return { status: "OK" };
  }, { params: MarketplaceEntryParams, body: MarketplacePatchBody });
