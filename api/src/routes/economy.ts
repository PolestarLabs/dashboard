/**
 * /api/economy/* and /api/users/:userID/balance|inventory|daily — Economy endpoints.
 * Thin Elysia controller — delegates to services/economy for currency operations.
 */

import Elysia from "elysia";
import { t } from "elysia";
import { authPlugin } from "@plugins/auth";
import { db } from "@plugins/db";
import type { Currency } from "@definitions/Currency";

import { pay, receive, transfer } from "@services/economy";
import { CurrencyOpBody, TransferBody } from "@schemas/economy";

export const economyRoutes = new Elysia({ prefix: "/", tags: ["economy"] })
  .use(authPlugin)

  .get("/users/:userID/balance", async ({ params, requireAuth, set }) => {
    requireAuth();
    const user = await db.users.get(params.userID);
    if (!user) { set.status = 404; return { error: "User not found" }; }
    return { userID: params.userID, currency: user.currency ?? {} };
  })

  .post("/users/:userID/inventory", async ({ params, body, requireAuth, set }) => {
    requireAuth();
    set.status = 501;
    return { message: "Not implemented" };
  })

  .get("/users/:userID/daily", async ({ params, requireAuth, set }) => {
    requireAuth();
    set.status = 501;
    return { message: "Not implemented" };
  })

  .post("/users/:userID/daily/claim", async ({ params, requireAuth, set }) => {
    requireAuth();
    set.status = 501;
    return { message: "Not implemented" };
  })

  .post("/economy/pay", async ({ body, requireAuth, set }) => {
    requireAuth();
    try {
      const result = await pay(
        body.userID,
        body.amount,
        body.type   ?? "OTHER",
        (body.currency ?? "RBN") as Currency,
      );
      return { success: true, transaction: result };
    } catch (err: any) {
      set.status = 400;
      return { error: err.message };
    }
  }, { body: CurrencyOpBody })

  .post("/economy/receive", async ({ body, requireAuth, set }) => {
    requireAuth();
    try {
      const result = await receive(
        body.userID,
        body.amount,
        body.type   ?? "OTHER",
        (body.currency ?? "RBN") as Currency,
      );
      return { success: true, transaction: result };
    } catch (err: any) {
      set.status = 400;
      return { error: err.message };
    }
  }, { body: CurrencyOpBody })

  .post("/economy/transfer", async ({ body, requireAuth, set }) => {
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
      );
      return { success: true, transaction: result };
    } catch (err: any) {
      set.status = 400;
      return { error: err.message };
    }
  }, { body: TransferBody })

  .post("/economy/transactions", async ({ body, requireAuth, set }) => {
    requireAuth();
    set.status = 501;
    return { message: "Not implemented" };
  })

  .get("/economy/transactions/:transactionID", async ({ params, requireAuth, set }) => {
    requireAuth();
    set.status = 501;
    return { message: "Not implemented" };
  });
