/**
 * routes/schemas.ts — Single source of truth for ALL Elysia/TypeBox validation schemas.
 * Merged from: models/{users,cosmetics,fanart,games,internal,leaderboards,prime,
 *              relationships,servers,ship,telemetry,utils,collections}.ts
 *              + services/collections/crafting/model.ts
 *
 * Domain interfaces (CosmeticDoc, WordEntry) live in routes/types.ts and are
 * re-exported here so controllers can keep a single import target.
 */

import RARITY_VALUES from "@definitions/constants/Rarity";
import { t } from "elysia";

// Re-export domain interfaces so controllers importing from @routes/schemas still work.
export type { CosmeticDoc, WordEntry } from "@routes/types";

// ── Users ────────────────────────────────────────────────────────────────────

export const UserSearchQuery = t.Object({
  id:             t.Optional(t.String()),
  name:           t.Optional(t.String()),
  donator:        t.Optional(t.String()),
  personalhandle: t.Optional(t.String()),
  skip:           t.Optional(t.String()),
  lim:            t.Optional(t.String()),
});

export const HandleCheckQuery = t.Object({
  handle: t.Optional(t.String()),
});

export const UserIdParams = t.Object({
  id: t.String({ default: "88120564400553984" }),
});

export const CommendQuery = t.Object({
  full: t.Optional(t.String()),
});

export const CommendEndpointParams = t.Object({
  id:       t.String({ default: "88120564400553984" }),
  endpoint: t.String(),
});

export const FanartHeartParams = t.Object({
  operation: t.Union([t.Literal("add"), t.Literal("remove")]),
  id:        t.String(),
});

// ── Cosmetics ────────────────────────────────────────────────────────────────

export const CosmeticSearchQuery = t.Object({
  id:      t.Optional(t.String()),
  rarity:  t.Optional(t.String()),
  code:    t.Optional(t.String()),
  event:   t.Optional(t.String()),
  icon:    t.Optional(t.String()),
  type:    t.Optional(t.String()),
  expires: t.Optional(t.String()),
  filter:  t.Optional(t.String()),
  name:    t.Optional(t.String()),
  before:  t.Optional(t.String()),
  after:   t.Optional(t.String()),
  searchq: t.Optional(t.String()),
  skip:    t.Optional(t.String()),
  lim:     t.Optional(t.String()),
  all:     t.Optional(t.String()),
  public:  t.Optional(t.String()),
});

export const CosmeticIdParams = t.Object({
  id: t.String(),
});

export const CosmeticCountParams = t.Object({
  type: t.String(),
});

export const CosmeticCountQuery = t.Object({
  event:  t.Optional(t.String()),
  rarity: t.Optional(t.String()),
});

export const CosmeticGenericParams = t.Object({
  other: t.String(),
  id:    t.String(),
});

// ── Fanart ───────────────────────────────────────────────────────────────────

export const FanartIdParams = t.Object({
  id: t.String(),
});

export const FanartUpdateParams = t.Object({
  id:   t.String(),
  what: t.String(),
});

export const FanartUpdateBody = t.Object({
  value:       t.Optional(t.String()),
  title:       t.Optional(t.String()),
  description: t.Optional(t.String()),
});

// ── Games ────────────────────────────────────────────────────────────────────

export const HangmaidQuery = t.Object({
  t: t.Optional(t.String()),  // theme
  l: t.Optional(t.String()),  // level
  q: t.Optional(t.String()),  // quantity
});

// ── Internal ─────────────────────────────────────────────────────────────────

export const PingFilterQuery = t.Object({
  filter: t.Optional(t.String()),
});

export const PingBody = t.Object({
  instance: t.String(),
  cluster:  t.Union([t.String(), t.Number()]),
  last:     t.Union([t.String(), t.Number()]),
  diff:     t.Optional(t.Number()),
});

// ── Leaderboards ─────────────────────────────────────────────────────────────

export const LeaderboardUserParams = t.Object({
  userID: t.String(),
});

export const LeaderboardServerParams = t.Object({
  serverID: t.String(),
});

export const LeaderboardPageQuery = t.Object({
  page: t.Optional(t.String()),
});

export const LeaderboardUserServerParams = t.Object({
  serverID: t.String(),
  userID:   t.String(),
});

// ── Prime / Patreon ──────────────────────────────────────────────────────────

export const PrimeServerParams = t.Object({
  serverID: t.String(),
});

export const PatreonFinderParams = t.Object({
  finder: t.String(),
});

export const PatreonTopParams = t.Object({
  max: t.String(),
});

export const PatreonTotalParams = t.Object({
  scale: t.String(),
});

export const PatreonTotalQuery = t.Object({
  active: t.Optional(t.String()),
});

// ── Relationships ────────────────────────────────────────────────────────────

export const RelationshipQuery = t.Object({
  id:   t.Optional(t.String()),
  uid:  t.Optional(t.String()),
  page: t.Optional(t.String()),
});

// ── Servers ──────────────────────────────────────────────────────────────────

export const ServerIdParams = t.Object({
  id: t.String(),
});

// ── Ship generator ───────────────────────────────────────────────────────────

export const ShipQuery = t.Object({
  av1: t.String(),
  av2: t.String(),
  spn: t.String(),
  pct: t.String(),
});

// ── Telemetry ────────────────────────────────────────────────────────────────

export const ThemeParams = t.Object({
  id: t.String(),
});

export const ThemeQuery = t.Object({
  user: t.Optional(t.String()),
});

// ── Utils ────────────────────────────────────────────────────────────────────

export const AchievementParams = t.Object({
  id: t.String(),
});

// ── Collections — Items ──────────────────────────────────────────────────────

export const ItemsEndpointParams = t.Object({ endpoint: t.String() });

export const ItemsSearchQuery = t.Object({
  id:         t.Optional(t.String()),
  rarity:     t.Optional(t.String()),
  code:       t.Optional(t.String()),
  type:       t.Optional(t.String()),
  crafted:    t.Optional(t.String()),
  open:       t.Optional(t.String()),
  all:        t.Optional(t.String()),
  craftables: t.Optional(t.String()),
  skip:       t.Optional(t.String()),
  lim:        t.Optional(t.String()),
});

// ── Collections — Crafting ───────────────────────────────────────────────────

export const PotItemSchema = t.Object({
  id:     t.String({ description: "Material item id" }),
  count:  t.Number({ description: "Quantity of that item" }),
  type:   t.Optional(t.String({ description: "Item type for type-crafting" })),
  rarity: t.Optional(t.String({ description: RARITY_VALUES.join(" | ") })) ,
});
export type PotItem = typeof PotItemSchema.static;

export const MixBodySchema = t.Object({
  pot: t.Array(PotItemSchema, { description: "Materials to throw in the pot" }),
});
export type MixBody = typeof MixBodySchema.static;

export const MixResponseSchema = t.Object({
  possible: t.Optional(t.Number({ description: "Number of possible discoveries with this pot" })),
  discovery: t.Object({
    id:     t.String({ examples: ["item_sword"] }),
    name:   t.String({ examples: ["Iron Sword"] }),
    rarity: t.String({ examples: ["R"] }),
  }, { description: "The discovered/crafted item" }),
  isDiscovery: t.Optional(t.Boolean({ description: "True if first time the user discovers this recipe" })),
  canCraftNow: t.Optional(t.Boolean({ description: "True if user has the exact materials to craft right now" })),
  typeCraft:   t.Optional(t.Boolean({ description: "True if match was type-based rather than exact" })),
  notQuite:    t.Optional(t.Boolean({ description: "True if a fallback item was returned but requirements aren't fully met" })),
  noMoreTable: t.Optional(t.Boolean({ description: "True if the pot types have no matchable items at all" })),
});

export type MixResponse = {
  discovery?:   { id: string; name?: string; rarity?: string };
  isDiscovery?: boolean;
  canCraftNow?: boolean;
  typeCraft?:   boolean;
  notQuite?:    boolean;
  noMoreTable?: boolean;
  error?:       string;
};

export const CreateBodySchema = t.Object({
  item: t.String({ description: "Item id to craft" }),
  pot:  t.Optional(t.Array(t.Object({
    id:    t.String(),
    count: t.Number(),
  }), { description: "Override material list; defaults to the item's stored recipe" })),
});
export type CreateBody = typeof CreateBodySchema.static;

export const CreateResponseSchema = t.Object({
  status:    t.String({ examples: ["OK", "ERROR"] }),
  message:   t.String(),
  inventory: t.Optional(t.Array(t.Unknown())),
});
export type CreateResponse = typeof CreateResponseSchema.static;

export const ItemParamsSchema = t.Object({ item: t.String({ description: "Item id" }) });
export type ItemParams = typeof ItemParamsSchema.static;

// ── Marketplace ───────────────────────────────────────────────────────────────

import CURRENCY_VALUES from "@definitions/constants/Currency";

export const MarketplaceListQuery = t.Object({
  id:        t.Optional(t.String({ description: "Exact listing ID" })),
  item_id:   t.Optional(t.String({ description: "Item ObjectId or legacy id" })),
  item_type: t.Optional(t.String({ description: "Item type filter (background|medal|sticker…)" })),
  author:    t.Optional(t.String({ description: "Author Discord snowflake" })),
  type:      t.Optional(t.Union([t.Literal("sell"), t.Literal("buy")])),
  price:     t.Optional(t.String({ description: "Exact price filter" })),
  after:     t.Optional(t.String({ description: "Unix ms — return listings posted after this time" })),
  before:    t.Optional(t.String({ description: "Unix ms — return listings posted before this time" })),
  limit:     t.Optional(t.String({ description: "Max results (1–100, default 25)" })),
  skip:      t.Optional(t.String({ description: "Skip N results" })),
  page:      t.Optional(t.String({ description: "Page index (multiplied by 25)" })),
  sort:      t.Optional(t.Union([t.Literal("oldest"), t.Literal("newest")])),
});
export type MarketplaceListQueryType = typeof MarketplaceListQuery.static;

export const MarketplaceEntryParams = t.Object({
  entry_id: t.String({ description: "Listing ID" }),
});

export const MarketplaceItemParams = t.Object({
  item: t.String({ description: "Item ObjectId or legacy id/code/icon" }),
});

export const MarketplacePostBody = t.Object({
  type:     t.Union([t.Literal("sell"), t.Literal("buy")]),
  item_id:  t.String({ description: "Item ObjectId" }),
  price:    t.Number({ minimum: 1 }),
  currency: t.Union(CURRENCY_VALUES.map((c) => t.Literal(c)) as any),
});
export type MarketplacePostBodyType = typeof MarketplacePostBody.static;

export const MarketplacePatchBody = t.Object({
  price: t.Number({ minimum: 1, description: "New listing price" }),
});

// ── Shared user-ID param (userID field, distinct from UserIdParams which uses `id`) ──

export const UserIDParam = t.Object({
  userID: t.String({ description: "Discord snowflake user ID" }),
});

// ── Quests ────────────────────────────────────────────────────────────────────

export const QuestGenericIdParams = t.Object({
  questGenericID: t.String({ description: "Generic quest template ID (shared across all users)" }),
});

export const UserQuestAssignParams = t.Object({
  userID:         t.String(),
  questGenericID: t.String(),
});

export const UserQuestUniqParams = t.Object({
  userID:      t.String(),
  questUniqID: t.String({ description: "Unique quest instance ID for this user (or 'all')" }),
});

export const QuestsBulkUpdateBody = t.Object({
  quests: t.Array(t.Object({
    questUniqID: t.String(),
    progression: t.Optional(t.Record(t.String(), t.Unknown())),
  }), { description: "Array of quest progression updates" }),
});

export const QuestUpdateBody = t.Object({
  progression: t.Optional(t.Record(t.String(), t.Unknown())),
  status:      t.Optional(t.Union([
    t.Literal("active"),
    t.Literal("completed"),
    t.Literal("failed"),
  ])),
});

// ── Progression ───────────────────────────────────────────────────────────────

export const ProgressionUpdateBody = t.Object({
  exp:   t.Optional(t.Number({ description: "XP delta (positive = gain)" })),
  level: t.Optional(t.Number()),
  data:  t.Optional(t.Record(t.String(), t.Unknown())),
});

// ── System ────────────────────────────────────────────────────────────────────

export const BlacklistPostBody = t.Object({
  reason: t.Optional(t.String({ description: "Reason recorded on the user's record" })),
});

export const AuditLogBody = t.Object({
  type:    t.String({ description: "Audit event type label (e.g. BAN, WARN, NOTE)" }),
  details: t.Optional(t.Record(t.String(), t.Unknown(), { description: "Arbitrary extra payload" })),
});

// ── Economy ───────────────────────────────────────────────────────────────────

export const EconomyTransactionIdParams = t.Object({
  transactionID: t.String({ description: "Transaction ID (snowflake-style)" }),
});

export const PayBody = t.Object({
  userID:   t.String({ description: "Discord snowflake of the user being debited" }),
  amount:   t.Number({ minimum: 1 }),
  type:     t.Optional(t.String({ description: "Transaction type label (default OTHER)" })),
  currency: t.Optional(t.String({ description: "Currency code (default RBN)" })),
});

export const ReceiveBody = t.Object({
  userID:   t.String({ description: "Discord snowflake of the user being credited" }),
  amount:   t.Number({ minimum: 1 }),
  type:     t.Optional(t.String({ description: "Transaction type label (default OTHER)" })),
  currency: t.Optional(t.String({ description: "Currency code (default RBN)" })),
});

export const TransferBody = t.Object({
  from:     t.String({ description: "Sender Discord snowflake" }),
  to:       t.String({ description: "Recipient Discord snowflake" }),
  amount:   t.Number({ minimum: 1 }),
  type:     t.Optional(t.String()),
  currency: t.Optional(t.String({ description: "Currency code (default RBN)" })),
});

export const TransactionsQueryBody = t.Object({
  userID:   t.Optional(t.String({ description: "Filter by sender or recipient ID" })),
  type:     t.Optional(t.String()),
  currency: t.Optional(t.String()),
  after:    t.Optional(t.Number({ description: "Unix ms lower bound" })),
  before:   t.Optional(t.Number({ description: "Unix ms upper bound" })),
  limit:    t.Optional(t.Number({ minimum: 1, maximum: 100 })),
  skip:     t.Optional(t.Number()),
});

export const InventoryUpdateBody = t.Object({
  items: t.Array(t.Object({
    id:    t.String({ description: "Item ID" }),
    count: t.Number({ description: "Count delta (positive = add, negative = remove)" }),
  }), { description: "Inventory item delta list" }),
});

// ── Adventure ─────────────────────────────────────────────────────────────────

export const AdventureLocationParams = t.Object({
  locationID: t.String(),
});

export const AdventureEncounterParams = t.Object({
  encounterID: t.String(),
});

export const AdventureJournalEntryParams = t.Object({
  userID:  t.String(),
  entryID: t.String(),
});
