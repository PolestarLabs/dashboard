/**
 * services/economy.ts — Economy / currency business logic.
 *
 * Faithful TypeScript port of bot/core/archetypes/Economy.js.
 *
 * Differences from the bot archetype (by design):
 *   - `db` is passed explicitly — no global `DB`.
 *   - `PLX.user.id` replaced by the `PLATFORM_ID` constant (env: BOT_USER_ID).
 *   - `Progression.emit` and `INSTR.inc` omitted (bot-only side-effects).
 *   - `logTransaction` console formatting omitted (structured logging preferred).
 */

import type { DB } from "@routes/types";

// ── Platform identity ────────────────────────────────────────────────────────

/** The bot's own Discord user ID — transactions from/to this skip fund checks. */
export const PLATFORM_ID: string = process.env.BOT_USER_ID ?? "DASHBOARD";

// ── Transaction type catalogue (mirrors bot archetype) ───────────────────────

export enum TRANSACTION_TYPES {
  daily=                         "Daily Rewards",
  webdaily=                      "Daily Rewards [Dashboard]",
  daily_10streak_website=        "Daily 10 Streak Bonus [Dashboard]",
  daily_3streak_website=         "Daily 3 Streak Bonus [Dashboard]",
  daily_250streak_website=       "Daily 250 Streak Bonus [Dashboard]",
  daily_365streak_website=       "Daily 365 Streak Bonus [Dashboard]",
  upvote_daily_boost_website=    "Daily Upvote Bonus [Dashboard]",
  special_daily_boost_website=   "Daily Special Bonus [Dashboard]",
  lootbox_drop=                  "Lootbox Drop: {{loot_id}}",
  lootbox_transfer=              "Lootbox Transfer: {{user_id}}",
  lootbox_rewards=               "Lootbox Rewards",
  lootbox_reroll=                "Lootbox Reroll",
  lootbox_transfer_tax=          "Lootbox Transfer Tax",
  rubine_transfer=               "Rubine Transfer Fee",
  gambling_betflip=              "Betflip",
  gambling_blackjack=            "Blackjack",
  gambling_roulette=             "Casino Roulette",
  gambling_russroll=             "Russian Roulette",
  role_purchase=                 "Role Purchase at {{server_id}}",
  bgshop_bot=                    "Background Quickbuy",
  bgshop_dash=                   "Background Shop Classic",
  background_shop_dash=          "Background Shop Classic",
  medalshop_dash=                "Medal Shop Classic",
  medal_shop_dash=               "Medal Shop Classic",
  bgshop_dash_bundle=            "Background Shop Bundle",
  medalshop_dash_bundle=         "Medal Shop Bundle",
  crafting_dash=                 "Crafting: [Dashboard]",
  crafting_bot=                  "Crafting: [Bot]",
  crafting_discovery=            "Crafting: [Discovery]",
  crafting_service=              "Crafting: {{player}} Service",
  crafting_advanced=             "Adv.Crafting: Material Costs",
  expand_gallery_slots=          "Expand Gallery Slots",
  sell_gallery_slots=            "Sell Gallery Slots",
  expand_wife_slots=             "Expand Marriage Slots",
  webshop_custom=                "Webshop(?) - {{type}}",
  storefront_bundle=             "Storefront: Bundle",
  storefront_background=         "Storefront: Background",
  storefront_medal=              "Storefront: Medal",
  storefront_other=              "Storefront: Other",
  marketplace_buy=               "Marketplace: BUY",
  marketplace_sell=              "Marketplace: SELL",
  marketplace_post=              "Marketplace: POST Fee",
  event_action=                  "Event: [{{action}}]",
  adm_awarded=                   "Admin Awarded",
  dono_rewards=                  "{{tier}} Rewards: {{month}}/{{year}}",
  dono_rewards_1st=              "{{tier}} Rewards: {{month}}/{{year}} (First Month Bonus)",
};


// ── Currency catalogue ───────────────────────────────────────────────────────
import type { Currency } from "@definitions/Currency";
import CURRENCY_VALUES from "@definitions/constants/Currency";

/**
 * Normalise a free-text currency string or array to canonical code(s).
 * Mirrors `parseCurrencies` in Economy.js exactly.
 */
export function parseCurrency(curr: string): Currency {
  const parsed = curr.trim().toUpperCase() as Currency;
  if (!(CURRENCY_VALUES.includes(parsed)))
    throw new Error(`Unknown currency: ${parsed}`);

  return parsed;
}

// ── Transaction payload ──────────────────────────────────────────────────────

export interface Transaction {
  transactionId: string;
  from:          string;
  to:            string;
  amt:           number;
  currency:      Currency;
  type:          string;
  subtype:       string;
  transaction:   string;
  timestamp:     number;
  [key: string]: unknown;
}

export interface TransactionOptions {
  /** Allow transactions where amt === 0 to persist in DB (default false). */
  allowZero?:         boolean;
  /** Skip fund check entirely (default false). */
  disableFundsCheck?: boolean;
  /** Extra fields merged into the audit payload. */
  fields?:            Record<string, unknown>;
}

// Snowflake-style transaction ID — matches bot archetype format exactly.
const SHARD_NUMBER = Number(process.env.SHARD) || 0;
let _lastTs = 0;
let _seq    = 0;

function generatePayload(
  userFrom: string | { id: string },
  userTo:   string | { id: string },
  amt:      number,
  type:     string,
  curr:     Currency,
  subtype:  string,
  symbol:   string,
  fields:   Record<string, unknown> = {},
): Transaction {
  if (!(userFrom && userTo && type && curr && subtype && symbol))
    throw new Error("generatePayload: missing arguments");
  if (typeof amt !== "number") throw new TypeError("Amount must be a number");

  const from = typeof userFrom === "object" ? userFrom.id : userFrom;
  const to   = typeof userTo   === "object" ? userTo.id   : userTo;

  const now = Date.now();
  if (now === _lastTs) _seq++;
  else { _lastTs = now; _seq = 0; }

  const transactionId = `${curr}${
    SHARD_NUMBER.toString(16).padStart(2, "0").toUpperCase()
  }${
    now.toString(36).toUpperCase()
  }${
    _seq.toString(36).padStart(2, "0").toUpperCase()
  }`;

  const payload: Transaction = {
    subtype,
    type,
    currency:    curr,
    transaction: symbol,
    from,
    to,
    timestamp:   now,
    transactionId,
    amt: amt < 0 ? -amt : amt,
  };

  return { ...fields, ...payload };
}

// ── Funds check ──────────────────────────────────────────────────────────────

/**
 * Returns `true` when `userId` holds at least `amount` of `currency`.
 * Always returns `true` for the platform account (unlimited funds).
 * Reads from `userData.currency[curr]` — same field path as the bot.
 */
export async function checkFunds(
  userId:   string | { id: string },
  amount:   number,
  currency: Currency,
  db:       DB,
): Promise<boolean> {

  if (!userId) throw new Error(`Missing user: ${String(userId)}`);

  const uID = typeof userId === "object" ? userId.id : userId;
  if (uID === PLATFORM_ID) return true;

  const userData = await db.users.get(uID);
  if (!userData) return false;

  const required = amount
  if (required === 0) return true;
  return (userData.currency?.[currency] ?? 0) >= required;
}

// ── Transfer ─────────────────────────────────────────────────────────────────

/**
 * Move `amt` of `curr` from `userFrom` to `userTo`.
 * Mirrors `transfer()` in Economy.js exactly (minus bot-only side-effects).
 */
export async function transfer(
  userFrom: string | { id: string },
  userTo:   string | { id: string },
  amount:   number,
  type:     string    = "SEND",
  curr:     Currency  = "RBN",
  subtype:  string    = "TRANSFER",
  symbol:   string    = ">",
  db:       DB,
  { allowZero = false, disableFundsCheck = false, fields = {} }: TransactionOptions = {},
): Promise<Transaction> {
  if (!(userFrom && userTo)) throw new Error("transfer: missing arguments");
  if (typeof amount !== "number") throw new TypeError("Amount must be a number");

  const uFrom = typeof userFrom === "object" ? userFrom.id : userFrom;
  const uTo   = typeof userTo   === "object" ? userTo.id   : userTo;

  const hasFunds = await checkFunds(uFrom, amount, curr, db);
  if (!hasFunds && !disableFundsCheck) throw new Error("NO FUNDS");

  const parsedCurr: Currency = parseCurrency(curr);

  const fromUpdate: Record<string, number> = {};
  const toUpdate:   Record<string, number> = {};

  const absAmt = Math.abs(amount);
  if (absAmt === 0 && !allowZero) throw new Error("Zero-amount transactions are not allowed");
  fromUpdate[`currency.${parsedCurr}`] = -absAmt;
  toUpdate[`currency.${parsedCurr}`]   =  absAmt;

  const payload: Transaction = generatePayload(uFrom, uTo, amount, type, parsedCurr, subtype, symbol, fields);

  await db.users.bulkWrite([
    { updateOne: { filter: { id: uFrom }, update: { $inc: fromUpdate } } },
    { updateOne: { filter: { id: uTo   }, update: { $inc: toUpdate   } } },
  ]);
  await db.audits.collection.insert(payload);

  return payload;
}
//------------------------------------------------------------------------------

/**
 * Debit `user` by `amt` (payment to platform). Mirrors `pay()` in Economy.js.
 */
export function pay(
  user:     string | { id: string },
  amt:      number,
  type:     string                = "OTHER",
  currency: Currency              = "RBN",
  db:       DB,
  options:  TransactionOptions    = {},
) {
  return transfer(user, PLATFORM_ID, amt, type, currency, "PAYMENT", "-", db, options);
}

/**
 * Credit `user` by `amt` (income from platform). Mirrors `receive()` in Economy.js.
 */
export function receive(
  user:     string | { id: string },
  amt:      number,
  type:     string                = "OTHER",
  currency: Currency              = "RBN",
  db:       DB,
  options:  TransactionOptions    = {},
) {
  return transfer(PLATFORM_ID, user, amt, type, currency, "INCOME", "+", db, options);
}

/**
 * Record an out-of-band audit entry without moving any balance.
 * Mirrors `arbitraryAudit()` in Economy.js.
 */
export async function arbitraryAudit(
  from:   string | { id: string },
  to:     string | { id: string },
  amt:    number                  = 1,
  type:   string                  = "ARBITRARY",
  pseudoCurrency: string          = "OTH",
  symbol: string                  = "!!",
  db:     DB,
  fields: Record<string, unknown> = {},
): Promise<Transaction> {
  if (!from || !to) throw new Error("arbitraryAudit: missing arguments");
  if (typeof amt !== "number") throw new TypeError("Amount must be a number");
  //@ts-ignore -> Allow free-form tags for arbitrary audits, even if they don't match Currency enum
  const payload = generatePayload(from, to, amt, type, pseudoCurrency, type, symbol, fields);
  await db.audits.new({ ...fields, ...payload });

  return payload;
}
