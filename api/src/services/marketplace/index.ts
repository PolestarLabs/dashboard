/**
 * services/marketplace.ts — Marketplace business logic, decoupled from Elysia.
 *
 * Ported from: DEV/dashboard/src/routes/api/shops/marketplace.js
 *
 * Bad-practice removals:
 *   - Global DB / PLX / ECO / userCache replaced by explicit `db` / `redis` params.
 *   - Affordability (fund checks) fully delegated to the economy service.
 *   - PLX.createMessage / PLX.editMessage omitted — bot-side Discord messaging
 *     is the bot's responsibility; left as //TODO markers.
 *   - console.log debugging noise removed.
 *   - entry._doc spreads replaced by lean() + explicit mapping.
 */

import { getDiscordUser, getManyDiscordUsers } from "@helpers/discord";
import {
  checkFunds, pay, transfer, arbitraryAudit,
  TRANSACTION_TYPES, parseCurrency,
} from "@services/economy";
import type { InventoryItemType } from "@definitions/InventoryItem";
import type { Currency } from "@definitions/Currency";
import type { ObjectId } from "mongoose";
import { Rarity } from "@definitions/Rarity";

// ── Types ────────────────────────────────────────────────────────────────────

type BuyOrSell = "buy" | "sell";

export interface MarketplaceEntry {
  id:          string;
  type:        BuyOrSell;
  author:      string;
  item_id:     string;
  item_type:   InventoryItemType;
  price:       number;
  currency:    Currency;
  img:         string;
  timestamp:   number;
  completed?:  boolean;
  lock?:       boolean;
  feedMessage?: [string, string];
}

export interface ItemDoc {
  _id:        ObjectId;
  id:         string;
  type:       InventoryItemType;
  code?:      string;
  icon?:      string;
  name?:      string;
  rarity?:    Rarity;
  tradeable?: boolean;
  droppable?: boolean;
}

export interface MarketplaceListQuery {
  id?:        string;
  item_id?:   string;
  item_type?: InventoryItemType;
  author?:    string;
  type?:      BuyOrSell;
  price?:     number;
  after?:     string;
  before?:    string;
  limit?:     number;
  skip?:      number;
  sort?:      string;
  page?:      number;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Maps an item to its image path (mirrors pathAssociations in the legacy code). */
export function getImagePath(item: ItemDoc): string {
  switch (item.type) {
    case "background":  return `/backgrounds/${item.code}.png`;
    case "medal":       return `/medals/${item.icon}.png`;
    case "sticker":     return `/stickers/${item.id}.png`;
    case "boosterpack": return `/items/${item.icon}.png`;
    default:            return `/items/${item.id}.png`;
  }
}

/**
 * Returns true if the item is tradeable.
 * Temporarily returns true unconditionally (mirrors the legacy TEMP SWITCH OFF).
 */
export function isTradeable(_item: ItemDoc): boolean {
  return !!_item.tradeable;
  // TODO: restore item.tradeable check once flags are reliable
}

/**
 * Inspect a user's inventory and determine if they have the given item.
 * Pure function — no DB calls. Returns query fragments for the update operation.
 */
export function itemInInventory(item: ItemDoc, cosmeticsData: Record<string, any>) {
  let res        = false;
  let reason     = "UNKNOWN";
  let httpStatus = 400;
  let query:    Record<string, any> = {};
  let prequery: Record<string, any> | undefined;

  // Holdables
  if (["junk", "boosterpack", "key", "material", "consumable"].includes(item.type)) {
    const owned = cosmeticsData?.inventory?.find((it: any) => it.id === item.id)?.count > 0;
    if (owned) {
      res      = true;
      prequery = { userId: cosmeticsData.userId, "inventory.id": item.id };
      query    = { $inc: { "inventory.$.count": -1 } };
    } else {
      res        = false;
      reason     = "ITEM NOT IN INVENTORY";
      httpStatus = 404;
    }
  // Cosmetics
  } else if (item.type === "background") {
    if (!cosmeticsData?.bgInventory?.includes(item.code)) {
      res        = false;
      reason     = "BACKGROUND NOT IN INVENTORY";
      httpStatus = 404;
    } else {
      res   = true;
      query = { $pull: { bgInventory: item.code } };
    }
  } else if (item.type === "medal") {
    if (!cosmeticsData?.medalInventory?.includes(item.icon)) {
      res        = false;
      reason     = "MEDAL NOT IN INVENTORY";
      httpStatus = 404;
    } else {
      res   = true;
      query = { $pull: { medalInventory: item.icon } };
    }
  } else if (item.type === "skin") {
    if (!cosmeticsData?.skinInventory?.includes(item.id)) {
      res        = false;
      reason     = "SKIN NOT IN INVENTORY";
      httpStatus = 404;
    } else {
      res   = true;
      query = { $pull: { skinInventory: item.id } };
    }
  } else if (item.type === "sticker" || item.type === "flair") {
    if (!cosmeticsData?.stickerInventory?.includes(item.id)) {
      res        = false;
      reason     = "STICKER NOT IN INVENTORY";
      httpStatus = 404;
    } else {
      res   = true;
      query = { $pull: { stickerInventory: item.id } };
    }
  }

  return { res, reason, status: httpStatus, query, prequery };
}

/**
 * Add or remove an item from a user's inventory.
 * Returns `true` on success, `false` on DB failure.
 */
export async function awardMarketplaceItem(
  item:   ItemDoc,
  userId: string,
  remove: boolean,
  db:     any,
): Promise<boolean> {
  const operation = remove ? "$pull" : "$addToSet";
  try {
    switch (item.type) {
      case "background":
        await db.userInventory.set(userId, { [operation]: { bgInventory: item.code } });
        return true;
      case "medal":
        await db.userInventory.set(userId, { [operation]: { medalInventory: item.icon } });
        return true;
      case "sticker":
      case "flair":
        await db.userInventory.set(userId, { [operation]: { stickerInventory: item.id } });
        return true;
      default: {
        if (remove) {
          const r = await db.userInventory.set(
            userId,
            { $inc: { "inventory.$[item].count": -1 } },
            { arrayFilters: [{ "item.id": item.id }] },
          ).catch(() => null);
          if (r?.modifiedCount > 0) return true;
        }
        await db.userInventory.set(userId, { $push: { inventory: { id: item.id, count: 1 } } });
        return true;
      }
    }
  } catch {
    return false;
  }
}

// ── Item lookup ───────────────────────────────────────────────────────────────

/**
 * Find an item by ObjectId or legacy id/code/icon.
 * Searches both `db.cosmetics` and `db.items`.
 */
export async function findItem(itemId: string, db: any): Promise<ItemDoc | null> {
  const isObjectId = /^[a-f\d]{24}$/i.test(itemId);

  const [cosResults, itmResults] = isObjectId
    ? await Promise.all([
        db.cosmetics.find({ _id: itemId }).lean().exec().catch(() => []),
        db.items.find({ _id: itemId }).lean().exec().catch(() => []),
      ])
    : await Promise.all([
        db.cosmetics.find({ $or: [{ id: itemId }, { icon: itemId }, { code: itemId }] }).lean().exec().catch(() => []),
        db.items.find({ id: itemId }).lean().exec().catch(() => []),
      ]);

  return (cosResults as ItemDoc[]).concat(itmResults as ItemDoc[])[0] ?? null;
}

/**
 * Get an item plus its current marketplace price stats.
 */
export async function getItemMarketDetails(itemId: string, db: any) {
  const item = await findItem(itemId, db);
  if (!item) return null;

  const marketplace: MarketplaceEntry[] = await db.marketplace
    .find({ item_id: String(item._id) })
    .noCache()
    .lean()
    .exec()
    .catch(() => []);

  const priceMap = marketplace.map(
    (x) => (x.currency === "SPH" ? 1000 : 1) * x.price,
  );

  return {
    item,
    max:     priceMap.length ? Math.max(...priceMap) : 0,
    min:     priceMap.length ? Math.min(...priceMap) : 0,
    average: priceMap.length ? priceMap.reduce((a, b) => a + b, 0) / priceMap.length : 0,
    entries: marketplace,
  };
}

// ── Eligibility checks ────────────────────────────────────────────────────────

/**
 * Can `userId` post a sell listing for `item` at `price` in `currency`?
 * Affordability is delegated to the economy service.
 */
export async function userCanSell(
  userId:    string,
  payload:   { price: number; currency: Currency },
  item:      ItemDoc,
  db:        any,
  softCheck  = false,
) {
  const [userData, cosmeticsData] = await Promise.all([
    db.users.findOne({ id: userId }).noCache(),
    db.userInventory.get(userId),
  ]);

  if (!softCheck) {
    if (!userData)
      return { res: false, reason: "USER NOT FOUND", status: 401 };

    const listingFee = payload.currency === "SPH"
      ? (2 + Math.floor(payload.price * 0.05))
      : payload.price * 0.15;

    if (!(await checkFunds(userId, listingFee, payload.currency, db)))
      return { res: false, reason: "NO INITIAL FUNDS", status: 422 };

    if (payload.currency === "SPH") {
      const hasLicense = (cosmeticsData?.inventory?.find((it: any) => it.id === "sph-license")?.count ?? 0) >= 1;
      if (!hasLicense)
        return { res: false, reason: "NO SAPPHIRE LICENSE", status: 401 };
    }
  }

  const invCheck = itemInInventory(item, cosmeticsData);

  if (!isTradeable(item))
    return { ...invCheck, res: false, reason: "ITEM IS NOT TRADEABLE", status: 403 };

  return invCheck;
}

/**
 * Can `userId` fulfill a buy listing (i.e. the buyer's request) for `item` at `price`?
 */
export async function userCanBuy(
  userId:   string,
  currency: Currency,
  price:    number,
  item:     ItemDoc,
  db:       any,
) {
  const cosmeticsData = await db.userInventory.get(userId);
  const invCheck      = itemInInventory(item, cosmeticsData);

  if (invCheck.res && ["background", "medal", "sticker", "flair", "skin"].includes(item.type))
    return { res: false, reason: "ITEM ALREADY OWNED", status: 403 };

  if (!(await checkFunds(userId, price, currency, db)))
    return { res: false, reason: "NO FUNDS", status: 422 };

  if (!isTradeable(item))
    return { res: false, reason: "ITEM IS NOT TRADEABLE", status: 403 };

  return { res: true, reason: "OK", status: 200 };
}

// ── CRUD operations ───────────────────────────────────────────────────────────

/**
 * Fetch marketplace listings with filter/pagination.
 * Resolves Discord user data via Redis-first helper (replaces userCache.get).
 */
export async function getMarketplaceListings(
  query: MarketplaceListQuery,
  redis: any,
  db:    any,
) {
  const filter: Record<string, any> = {};

  if (query.id)        filter.id        = query.id;
  if (query.item_id)   filter.item_id   = query.item_id;
  if (query.item_type) filter.item_type = query.item_type;
  if (query.author)    filter.author    = query.author;
  if (query.type)      filter.type      = query.type;
  if (query.price)     filter.price     = query.price;

  if (query.after)  filter.timestamp = { $gte: Number(query.after)  || Date.now() - 86_400_000 };
  if (query.before) filter.timestamp = { $lte: Number(query.before) || Date.now() };

  const lim  = Math.min(Number(query.limit) || 25, 100);
  const skip = Number(query.skip) || (Number(query.page) * 25) || 0;
  const sort = query.sort === "oldest" ? 1 : -1;

  const results: MarketplaceEntry[] = await db.marketplace
    .find(filter, { __v: 0 })
    .sort({ timestamp: sort })
    .limit(lim)
    .skip(skip)
    .noCache()
    .lean();

  if (!results.length) return [];

  const authorIds = [...new Set(results.map((e) => e.author))];
  const itemIds   = results.map((e) => e.item_id).filter((id) => /^[a-f\d]{24}$/i.test(id));

  const [users, cosmetics, goods] = await Promise.all([
    Promise.all(authorIds.map((id) => getDiscordUser(id, redis))),
    db.cosmetics.find({ _id: { $in: itemIds } }).lean().catch(() => []),
    db.items.find({ _id: { $in: itemIds } }).lean().catch(() => []),
  ]);

  const userMap: Record<string, any> = Object.fromEntries(
    users.map((u) => [u.id, u]),
  );

  const allItems: ItemDoc[] = (cosmetics as ItemDoc[]).concat(goods as ItemDoc[]);

  return results.map((entry) => ({
    ...entry,
    userdata: userMap[entry.author] ?? { id: entry.author, username: "Unknown", avatar: null },
    itemdata: allItems.find((i) => String(i._id) === String(entry.item_id)) ?? null,
  }));
}

/**
 * Post a new marketplace listing.
 */
export async function postListing(
  payload: {
    author:    string;
    type:      "sell" | "buy";
    item_id:   string;
    price:     number;
    currency:  Currency;
  },
  redis: any,
  db:    any,
): Promise<{ ok: true; entry: MarketplaceEntry } | { ok: false; status: number; message: string }> {
  const details = await getItemMarketDetails(payload.item_id, db);
  if (!details) return { ok: false, status: 404, message: "Item not found" };

  const { item } = details;
  const currency = parseCurrency(payload.currency);

  if (payload.type === "sell") {
    const canSell = await userCanSell(payload.author, { price: payload.price, currency }, item, db);
    if (!canSell.res)
      return { ok: false, status: canSell.status ?? 400, message: canSell.reason ?? "Cannot sell" };

    const sellQuery    = (canSell as any).query    as Record<string, any> | undefined;
    const sellPrequery = (canSell as any).prequery as Record<string, any> | undefined;
    const finder = sellPrequery ?? { userId: payload.author };
    if (sellQuery && Object.keys(sellQuery).length) {
      await db.userInventory.updateOne(finder, sellQuery);
    }

    const listingFee = currency === "SPH" ? 2 : payload.price * 0.15;
    await pay(payload.author, listingFee, TRANSACTION_TYPES.marketplace_post, currency, db);

  } else if (payload.type === "buy") {
    const canBuy = await userCanBuy(payload.author, currency, payload.price, item, db);
    if (!canBuy.res)
      return { ok: false, status: canBuy.status ?? 400, message: canBuy.reason ?? "Cannot buy" };

    const deposit    = Math.abs(payload.price);
    const listingFee = currency === "SPH" ? 2 : payload.price * 0.05;
    await pay(payload.author, deposit,    TRANSACTION_TYPES.marketplace_buy,  currency, db);
    await pay(payload.author, listingFee, TRANSACTION_TYPES.marketplace_post, currency, db);

  } else {
    return { ok: false, status: 400, message: "Invalid listing type" };
  }

  const entry: MarketplaceEntry = {
    id:        Date.now().toString(16).toUpperCase() + process.pid,
    timestamp: Date.now(),
    item_type: item.type,
    img:       getImagePath(item),
    ...payload,
    type:     payload.type,
    currency,
  };

  await db.marketplace.new(entry);

  // TODO: notify Discord feed channel via bot HTTP callback

  return { ok: true, entry };
}

/**
 * Purchase an item from an active "sell" listing.
 */
export async function buyFromListing(
  entryId:     string,
  currentUser: { id: string },
  db:          any,
): Promise<{ ok: true; receipt: any } | { ok: false; status: number; message: string }> {
  const entry: MarketplaceEntry | null = await db.marketplace
    .findOne({ id: entryId })
    .noCache()
    .lean();

  if (!entry)            return { ok: false, status: 404, message: "Entry not found" };
  if (entry.completed)   return { ok: false, status: 410, message: "Listing has been terminated" };
  if (entry.lock)        return { ok: false, status: 409, message: "Entry is locked" };
  if (entry.author === currentUser.id) return { ok: false, status: 403, message: "Cannot buy from self" };
  if (entry.type !== "sell")           return { ok: false, status: 403, message: "Listing is not for sale" };

  const details = await getItemMarketDetails(entry.item_id, db);
  if (!details) return { ok: false, status: 404, message: "Item not found" };

  const canBuy = await userCanBuy(currentUser.id, entry.currency, entry.price, details.item, db);
  if (!canBuy.res) return { ok: false, status: canBuy.status ?? 400, message: canBuy.reason ?? "Cannot buy" };

  await db.marketplace.updateOne({ id: entryId }, { $set: { lock: true } });

  const sold = await awardMarketplaceItem(details.item, currentUser.id, false, db);
  if (!sold) {
    await db.marketplace.updateOne({ id: entryId }, { $set: { lock: false } });
    return { ok: false, status: 500, message: "Failed to award item" };
  }

  try {
    const receipt = await transfer(
      currentUser.id,
      entry.author,
      entry.price,
      TRANSACTION_TYPES.marketplace_buy,
      entry.currency,
      "TRANSFER",
      ">",
      db,
    );

    const tradeCut = Math.ceil(entry.price * 0.02);
    await pay(entry.author, tradeCut, TRANSACTION_TYPES.marketplace_sell, entry.currency, db);
    await db.users.set(
      { id: currentUser.id },
      { $inc: { "progression.exp": Math.floor(entry.price / 12) } },
    );
    await db.marketplace.updateOne({ id: entryId }, { $set: { completed: true } });

    // TODO: update Discord feed message via bot HTTP callback

    return { ok: true, receipt };
  } catch (err) {
    await db.marketplace.updateOne({ id: entryId }, { $set: { lock: false } });
    throw err;
  }
}

/**
 * Sell an item to fulfill an active "buy" listing.
 */
export async function sellToListing(
  entryId:     string,
  currentUser: { id: string },
  db:          any,
): Promise<{ ok: true; receipt: any } | { ok: false; status: number; message: string }> {
  const entry: MarketplaceEntry | null = await db.marketplace
    .findOne({ id: entryId })
    .noCache()
    .lean();

  if (!entry)            return { ok: false, status: 404, message: "Entry not found" };
  if (entry.completed)   return { ok: false, status: 410, message: "Listing has been terminated" };
  if (entry.lock)        return { ok: false, status: 409, message: "Entry is locked" };
  if (entry.author === currentUser.id) return { ok: false, status: 403, message: "Cannot fill own listing" };
  if (entry.type !== "buy")            return { ok: false, status: 403, message: "Listing is for purchase only" };

  const details = await getItemMarketDetails(entry.item_id, db);
  if (!details) return { ok: false, status: 404, message: "Item not found" };

  const canSell = await userCanSell(
    currentUser.id,
    { price: entry.price, currency: entry.currency },
    details.item,
    db,
    true, // soft check — no fund check for the seller; they receive payment
  );
  if (!canSell.res)
    return { ok: false, status: canSell.status ?? 400, message: canSell.reason ?? "Cannot sell" };

  await db.marketplace.updateOne({ id: entryId }, { $set: { lock: true } });

  const removedFromSeller  = await awardMarketplaceItem(details.item, currentUser.id, true,  db);
  const awardedToBuyer     = await awardMarketplaceItem(details.item, entry.author,    false, db);

  if (!removedFromSeller || !awardedToBuyer) {
    await db.marketplace.updateOne({ id: entryId }, { $set: { lock: false } });
    return { ok: false, status: 500, message: "Failed to transfer item" };
  }

  try {
    const receipt = await arbitraryAudit(
      entry.author,
      currentUser.id,
      entry.price,
      TRANSACTION_TYPES.marketplace_sell,
      entry.currency,
      "!!",
      db,
    );

    const tradeCut = Math.ceil(entry.price * 0.05);
    await pay(currentUser.id, tradeCut, TRANSACTION_TYPES.marketplace_sell, entry.currency, db);
    await db.users.set(
      currentUser.id,
      {
        $inc: {
          "progression.exp":               Math.floor(entry.price / 100),
          [`currency.${entry.currency}`]:  entry.price,
        },
      },
    );
    await db.marketplace.updateOne({ id: entryId }, { $set: { completed: true } });

    // TODO: update Discord feed message via bot HTTP callback

    return { ok: true, receipt };
  } catch (err) {
    await db.marketplace.updateOne({ id: entryId }, { $set: { lock: false } });
    throw err;
  }
}

/**
 * Cancel a listing and restore the item to its author (sell listings only).
 */
export async function deleteListing(
  entryId: string,
  userId:  string,
  db:      any,
): Promise<{ ok: true } | { ok: false; status: number; message: string }> {
  const entry: MarketplaceEntry | null = await db.marketplace.findOne({ id: entryId }).lean();
  if (!entry)                return { ok: false, status: 404, message: "Entry not found" };
  if (entry.author !== userId) return { ok: false, status: 403, message: "Not allowed" };

  const details = await getItemMarketDetails(entry.item_id, db);
  if (!details) return { ok: false, status: 404, message: "Item not found" };

  const removed = await db.marketplace.remove({ id: entryId }).lean();
  if (!removed?.deletedCount) return { ok: false, status: 410, message: "Nothing to remove" };

  // Restore item to author for sell listings
  if (entry.type === "sell")
    await awardMarketplaceItem(details.item, userId, false, db);

  return { ok: true };
}

/**
 * Update the price of an existing (open) listing. Author-only.
 */
export async function editListingPrice(
  entryId:  string,
  userId:   string,
  newPrice: number,
  db:       any,
): Promise<{ ok: true } | { ok: false; status: number; message: string }> {
  const entry: MarketplaceEntry | null = await db.marketplace.findOne({ id: entryId }).lean();
  if (!entry)                return { ok: false, status: 404, message: "Entry not found" };
  if (entry.author !== userId) return { ok: false, status: 403, message: "Not allowed" };

  const result = await db.marketplace
    .updateOne({ id: entryId }, { $set: { price: newPrice } })
    .lean();

  if (!result.nModified) return { ok: false, status: 410, message: "Nothing to update" };

  // TODO: update Discord feed message via bot HTTP callback

  return { ok: true };
}
