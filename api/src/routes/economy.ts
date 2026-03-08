/**
 * /api/economy/* and /api/users/:userID/balance|inventory|daily — Economy endpoints.
 * Thin Elysia controller — delegates to services/economy for currency operations.
 *
 * Fully implemented:
 *   GET  /users/:userID/balance         — reads db.users directly
 *   POST /economy/pay                   → services/economy.pay()
 *   POST /economy/receive               → services/economy.receive()
 *   POST /economy/transfer              → services/economy.transfer()
 *
 * Scaffolded (TODO):
 *   POST /users/:userID/inventory       — no service yet
 *   GET  /users/:userID/daily           — no service yet
 *   POST /users/:userID/daily/claim     — no service yet
 *   POST /economy/transactions          — db.audits query needed
 *   GET  /economy/transactions/:id      — db.audits lookup needed
 *
 * Auth model:
 *   /users/:userID/* routes → user-only (self) or admin
 *   /economy/pay|receive|transfer → app-authed (requireAuth)
 *   /economy/transactions → user-only
 */

import Elysia from "elysia";
import { authPlugin } from "@plugins/auth";
import { dbPlugin } from "@plugins/db";
import type { DB } from "@routes/types";
import type { Currency } from "@definitions/Currency";

import {
  UserIDParam,
  EconomyTransactionIdParams,
  PayBody,
  ReceiveBody,
  TransferBody,
  TransactionsQueryBody,
  InventoryUpdateBody,
} from "@routes/_schemas";

import { pay, receive, transfer } from "@services/economy";

export const economyRoutes = new Elysia({ prefix: "/", tags: ["economy"] })
  .use(authPlugin)
  .use(dbPlugin)

  // ── Per-user economy data ──────────────────────────────────────────────────

  // GET /users/:userID/balance — return all currency balances for a user (user-only / admin)
  .get("/users/:userID/balance", async ({ params, requireAuth, db, set }) => {
    requireAuth();
    // TODO: requireSelfOrAdmin(apiUser, params.userID)
    const user = await (db as DB).users.get(params.userID);
    if (!user) { set.status = 404; return { error: "User not found" }; }
    return { userID: params.userID, currency: user.currency ?? {} };
  }, { params: UserIDParam })

  // POST /users/:userID/inventory — apply item delta to a user's inventory (user-only / admin)
  .post("/users/:userID/inventory", async ({ params, body, requireAuth, set }) => {
    requireAuth();
    // TODO: requireSelfOrAdmin(apiUser, params.userID)
    // TODO: services/economy.ts (or services/items.ts) → updateInventory(params.userID, body.items, db)
    set.status = 501;
    return { message: "Not implemented" };
  }, { params: UserIDParam, body: InventoryUpdateBody })

  // GET /users/:userID/daily — get daily reward status and streak info (user-only / admin)
  .get("/users/:userID/daily", async ({ params, requireAuth, set }) => {
    requireAuth();
    // TODO: requireSelfOrAdmin(apiUser, params.userID)
    // TODO: services/economy.ts → getDailyInfo(params.userID, db)
    //       → returns { canClaim, streak, nextClaimAt, rewards }
    set.status = 501;
    return { message: "Not implemented" };
  }, { params: UserIDParam })

  // POST /users/:userID/daily/claim — claim today's daily reward (user-only / admin)
  .post("/users/:userID/daily/claim", async ({ params, requireAuth, set }) => {
    requireAuth();
    // TODO: requireSelfOrAdmin(apiUser, params.userID)
    // TODO: services/economy.ts → claimDaily(params.userID, db)
    //       → applies TRANSACTION_TYPES.webdaily, updates streak counters
    set.status = 501;
    return { message: "Not implemented" };
  }, { params: UserIDParam })

  // ── Platform-level transfers ───────────────────────────────────────────────

  // POST /economy/pay — debit a user's balance to the platform bank (app-authed)
  .post("/economy/pay", async ({ body, requireAuth, db, set }) => {
    requireAuth();
    try {
      const result = await pay(
        body.userID,
        body.amount,
        body.type   ?? "OTHER",
        (body.currency ?? "RBN") as Currency,
        db as DB,
      );
      return { success: true, transaction: result };
    } catch (err: any) {
      set.status = 400;
      return { error: err.message };
    }
  }, { body: PayBody })

  // POST /economy/receive — credit a user's balance from the platform bank (app-authed)
  .post("/economy/receive", async ({ body, requireAuth, db, set }) => {
    requireAuth();
    try {
      const result = await receive(
        body.userID,
        body.amount,
        body.type   ?? "OTHER",
        (body.currency ?? "RBN") as Currency,
        db as DB,
      );
      return { success: true, transaction: result };
    } catch (err: any) {
      set.status = 400;
      return { error: err.message };
    }
  }, { body: ReceiveBody })

  // POST /economy/transfer — move balance from one user to another (app-authed)
  .post("/economy/transfer", async ({ body, requireAuth, db, set }) => {
    requireAuth();
    try {
      const result = await transfer(
        body.from,
        body.to,
        body.amount,
        body.type   ?? "SEND",
        (body.currency ?? "RBN") as Currency,
        "TRANSFER",
        ">",
        db as DB,
      );
      return { success: true, transaction: result };
    } catch (err: any) {
      set.status = 400;
      return { error: err.message };
    }
  }, { body: TransferBody })

  // ── Transaction history ────────────────────────────────────────────────────

  // POST /economy/transactions — query transaction history with filters (user-only)
  .post("/economy/transactions", async ({ body, requireAuth, set }) => {
    requireAuth();
    // TODO: build a Mongo query on db.audits using body filters (userID, type, currency, after, before, limit, skip)
    //       → db.audits.find({ $or: [{ from: body.userID }, { to: body.userID }], ... })
    set.status = 501;
    return { message: "Not implemented" };
  }, { body: TransactionsQueryBody })

  // GET /economy/transactions/:transactionID — fetch a single transaction entry (user-only)
  .get("/economy/transactions/:transactionID", async ({ params, requireAuth, set }) => {
    requireAuth();
    // TODO: db.audits.findOne({ transactionId: params.transactionID })
    set.status = 501;
    return { message: "Not implemented" };
  }, { params: EconomyTransactionIdParams });
