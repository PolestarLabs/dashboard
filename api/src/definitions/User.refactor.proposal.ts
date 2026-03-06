/**
 * ============================================================
 * USER DOCUMENT REFACTOR PROPOSAL
 * ============================================================
 *
 * FINDINGS — why the current document is a problem
 * -------------------------------------------------
 * The real user document weighs in at ~4 800 lines in serialised form.
 * The core issues, in order of severity:
 *
 *  1. SECURITY HAZARD
 *     - `discordData.accessToken` (Discord OAuth token) stored in plaintext on the user root.
 *     - `connections.patreon.access_token` + `connections.patreon.refresh_token` in plaintext.
 *     - `discordData.refreshToken` exposed on the subdoc.
 *     - `personal` block (IP, hostname, GPS coords, ISP) co-located with the main user.
 *       A single leaked query exposes PII for every user.
 *     - `discordData.email` stored permanently.
 *
 *  2. DOCUMENT SIZE / READ AMPLIFICATION
 *     - `modules.bgInventory`      — ~200 backdrop IDs   (flat string array)
 *     - `modules.medalInventory`   — ~350 medal IDs      (many nulls)
 *     - `modules.stickerInventory` — ~200 sticker IDs
 *     - `discordData.guilds`        — ~80 guild objects, each with a full `features[]` string array
 *       Every profile read loads the *entire guild list* even when the caller
 *       only wants the avatar or currency balance.
 *
 *  3. SCHEMA SMELL / DATA QUALITY
 *     - `null` entries scattered throughout inventory/medal arrays.
 *     - Duplicate server IDs in `prime.servers`.
 *     - `modules.daily` (ms timestamp) duplicated at `counters.daily.last`.
 *     - `modules.level` / `modules.exp` duplicated at `counters.legacy.*`.
 *     - `module` (singular) shadow-object for the new inventory system coexists with `modules`.
 *     - `rubinesOld` — dead migration artefact.
 *     - `EVT` / `EVTbkp` under `modules` AND `eventTokens` at root — three competing counters.
 *     - `discordData.connections` (linked accounts) buried three levels deep.
 *
 *  4. WRONG COLLECTION BOUNDARY
 *     - `quests`, `married`, `progression` should be either sub-collections or their
 *       own lightweight documents; they have completely different access patterns.
 *     - Analytics data (`counters.dashThemeClicks`) lives on the hot-path user document.
 *
 * ============================================================
 *  PROPOSED SCHEMA SPLIT  (7 collections)
 * ============================================================
 *
 *  Collection          | Indices                      | Replaces / owns
 *  ------------------- | ---------------------------- | ----------------------------
 *  users               | id (unique), donator         | lean core doc (below)
 *  user_cosmetics      | userId (unique)              | all inventory arrays + cherryCosmetics
 *  user_guilds         | userId, guildId              | discordData.guilds  → Redis preferred
 *  user_oauth          | userId (unique)              | all OAuth tokens + personal + discordIdentityCache
 *  user_quests         | userId, id                   | quests[]
 *  user_analytics      | userId                       | dashThemeClicks, legacy XP, statistics, craftingExp
 *  user_connections    | userId, type                 | connections.* (lastfm, discord identity, battlenet…)
 */

import type { ObjectId } from "mongoose";

// ─────────────────────────────────────────────────────────────
// 1. CORE USER  (replaces the 4 800-line monolith)
//    Target size: < 30 fields, well under 16 KB
// ─────────────────────────────────────────────────────────────

/**
 * `users` collection  — hot-path document, loaded on every request.
 * Rule: if it is not needed to render the profile card or run a command, it does NOT live here.
 */
export interface UserCore {
  _id: ObjectId;
  id: string;              // Discord snowflake

  // ── Identity (from Discord, cached) ────────────────────────
  name: string;
  tag: string;             // "name#discrim" or "name" for pomelo users
  avatar: string | null;
  banner: string | null;

  // ── Custom handle (Prime feature) ──────────────────────────
  // Schema: { type: String, trim: true, index: true, unique: true, sparse: true }
  // Stays in core users — it is a unique identity field and needs its own index.
  personalhandle?: string;

  // ── Progression ────────────────────────────────────────────
  level: number;           // current level (was modules.level)
  exp: number;             // XP towards next level (was modules.exp)
  rep: number;
  repdaily: number;

  // ── Currencies ─────────────────────────────────────────────
  RBN: number;             // Rubines
  SPH: number;             // Sapphires
  JDE: number;             // Jades
  PSM: number;
  EVT: number;             // Event tokens (single source of truth — drop EVTbkp, eventTokens)
  cherries: number;        // Cherry currency (was missing from proposal)
  lovepoints: number;      // Love points — separate social currency (was modules.lovepoints)

  // ── Active cosmetic slots ───────────────────────────────────
  profile: {
    bgID: string | null;
    flairTop: string | null;
    flairDown: string | null;
    sticker: string | null;
    favcolor: string;
    persotext: string;
    tagline: string;
    medals: string[];      // small: 9 equipped medals max
    skins: Record<string, string>;  // { blackjack: "skin_id" }
  };

  // ── Subscription ───────────────────────────────────────────
  donator: string | null;       // tier slug ("carbon" | "uranium" | …) — legacy field
  donatorActive: string | null; // currently-active tier; separate from donator
  prime: {
    active: boolean;
    tier: string | null;
    maxServers: number;
    lastClaimed: number;
    servers: string[];       // de-duplicated guild IDs
    canReallocate: boolean;
    custom_background: boolean;
    custom_handle: boolean;
    custom_shop: boolean;
  } | null;

  // ── Access control ─────────────────────────────────────────
  PERMS: number;
  // Schema definition is String, not boolean — stores the reason/category string.
  blacklisted?: string;
  // User account hidden from public listings
  hidden?: boolean;

  // ── Feature flags / preferences ────────────────────────────
  switches: {
    favServers: string[];
    dashTheme: string;
    booruPublic: boolean;
    booruSlots: number;
    flagOverride?: string;
    profileFrame?: boolean;
    variables?: Array<{ tag: string; value: string }>;
    custom_rt?: { seed: number; items: string[] };
  };

  // ── Counters (only time-sensitive ones) ────────────────────
  counters: {
    daily: {
      last: number;
      streak: number;
      lastStreak: number;
      highest: number;
      insured: boolean;
    };
    prime_streak: Record<string, number>;  // tier → count
    transfer_box: { last: number };
    thx: { last: number; lastStreak: number | null };
    commend: { last: number; lastStreak: number | null };
    transfer_rbn: { last: number; lastStreak: number | null };
    errands: { last: number };
    cross_server_box_attempts: number;
    hearts: string[];
    // Monthly rewards tracking (was root-level rewardsMonth / rewardsClaimed)
    rewardsMonth: number;
    rewardsClaimed: boolean;
    // Event specifics (was root-level eventDaily / spdaily)
    eventDaily: number;
    spdaily: number;
  };

  // ── Social ─────────────────────────────────────────────────
  married: string[];            // keep here — small array of ObjectId strings
  featuredMarriage: string | null;

  // ── Event data ─────────────────────────────────────────────
  // Root-level Mixed blob for active event state; stays in core since it is
  // ephemeral and event-scoped (purged post-event). Consider a dedicated
  // `user_events` collection if multiple simultaneous events need isolation.
  eventData?: Record<string, unknown>;
  eventGoodie?: number;

  // ── Rate / usage limits ────────────────────────────────────
  // Mixed blob set by admin tooling; stays in core (small, read-frequently).
  limits?: Record<string, unknown>;

  // ── Misc ───────────────────────────────────────────────────
  lastUpdated: Date;
  migrated: boolean;

  // ── Cherry cosmetic collection ─────────────────────────────
  // The `cherrySet` Mixed sub-doc tracks which cherry variants are collected.
  // Cherry IDs live in user_cosmetics; the set/progress blob stays here.
  cherrySet?: Record<string, unknown>;

  // ── Social features ────────────────────────────────────────
  // Was modules.fun — waifu/lover/ship data; small object, keep in core.
  fun?: {
    waifu?: unknown;
    lovers?: unknown;
    shiprate?: unknown;
  };

  // ── Powerups ───────────────────────────────────────────────
  // Was modules.powerups — active powerup state; small Mixed, keep in core.
  powerups?: Record<string, unknown>;
}

/*
 * REMOVED from users:
 *
 * → user_cosmetics:
 *   modules.inventory, modules.bgInventory, modules.medalInventory,
 *   modules.stickerInventory, modules.flairsInventory, modules.skinInventory,
 *   modules.stickerCollection, modules.fishCollection, modules.fishes,
 *   modules.achievements, cherryCosmetics
 *
 * → user_quests:
 *   quests[]
 *
 * → user_guilds (Redis preferred):
 *   discordData.guilds[]
 *
 * → user_oauth (ENCRYPTED at rest):
 *   discordData.accessToken, discordData.refreshToken, discordData.email,
 *   connections.patreon.access_token, connections.patreon.refresh_token,
 *   personal{ ip, hostname, city, region, country, loc, org, postal, timezone },
 *   connections.discord identity blob (discordIdentityCache)
 *
 * → user_connections:
 *   discordData.connections[] (battlenet, domain, …),
 *   connections.lastfm, connections.twitter, connections.spotify, connections.twitch
 *
 * → user_analytics:
 *   modules.statistics, counters.dashThemeClicks,
 *   counters.legacy.{ globalLV, globalXP }, progression.craftingExp
 *
 * → FOLDED into UserCore (new location):
 *   modules.level / modules.exp         → UserCore.level / .exp
 *   modules.lovepoints                  → UserCore.lovepoints
 *   modules.powerups                    → UserCore.powerups (Mixed, small)
 *   modules.fun                         → UserCore.fun (small social blob)
 *   meta{ tag, avatar, … }             → UserCore.name / .avatar / .tag
 *   rewardsMonth / rewardsClaimed       → UserCore.counters.*
 *   eventDaily / spdaily               → UserCore.counters.*
 *   modules.dyStreakHard                → UserCore.counters.daily
 *
 * → DROPPED (dead data):
 *   rubinesOld, modules.coins, EVTbkp,
 *   eventTokens (root — consolidate into users.EVT),
 *   modules.daily (duplicate of counters.daily.last),
 *   module (singular, pending migration to user_cosmetics.inventory)
 */


// ─────────────────────────────────────────────────────────────
// 2. USER COSMETICS  (new collection: `user_cosmetics`)
// ─────────────────────────────────────────────────────────────

/**
 * One document per user.  Index: { userId: 1 } unique.
 *
 * Rationale: cosmetic inventories are large, append-heavy, and almost never
 * needed by bot commands or API reads that only want level/currency.
 * Decoupling them drops the hot-path user document from ~4 800 lines to ~30 fields.
 */
export interface UserCosmetics {
  _id: ObjectId;
  userId: string;             // FK → UserCore.id

  // Raw item inventory  (was modules.inventory[])
  // Nulls removed; `count: 0` items kept only while `crafted > 0`
  inventory: Array<{
    id: string;
    count: number;
    crafted?: number;
  }>;

  bgInventory: string[];      // backdrop IDs owned
  skinInventory: string[];    // skin IDs
  flairsInventory: string[];  // flair IDs
  medalInventory: string[];   // medal IDs  (nulls stripped on migration)
  stickerInventory: string[];
  stickerCollection: string[];
  fishes: string[];
  fishCollection: string[];
  achievements: string[];

  // Cherry IDs collected (was root cherries currency kept in UserCore;
  // the ID list of cherry cosmetics moves here)
  cherryCosmetics?: string[];
}

/*
 * Mongoose schema hint:
 *
 *   const UserCosmeticsSchema = new Schema({
 *     userId: { type: String, required: true, unique: true, index: true },
 *     inventory: [{ id: String, count: Number, crafted: Number }],
 *     bgInventory:       [String],
 *     skinInventory:     [String],
 *     flairsInventory:   [String],
 *     medalInventory:    [String],
 *     stickerInventory:  [String],
 *     stickerCollection: [String],
 *     fishes:            [String],
 *     fishCollection:    [String],
 *     achievements:      [String],
 *   });
 */


// ─────────────────────────────────────────────────────────────
// 3. USER OAUTH  (new collection: `user_oauth`)
// ─────────────────────────────────────────────────────────────

/**
 * One document per user.  Index: { userId: 1 } unique.
 *
 * SECURITY RULES:
 *  - All token fields MUST be encrypted at rest (AES-256-GCM via a KMS key).
 *  - This collection must have its own MongoDB role; it should NOT be readable
 *    via the general `DB.users` handle.
 *  - `personal` (IP data) lives here so it cannot be accidentally included in
 *    a general user projection.
 *  - Email is stored once and never returned by API routes that don't explicitly
 *    need it (dashboard account page only).
 */
export interface UserOAuth {
  _id: ObjectId;
  userId: string;             // FK → UserCore.id

  // ── Discord OAuth2 session  — store encrypted ───────────────
  // NOTE: `connections.discord` in the schema is a separate Mixed blob that
  // caches the Discord identity response (username, avatar, etc.).  It is
  // NOT the same as the OAuth token pair here.  Keep in UserOAuth but as a
  // distinct field so they can be rotated/purged independently.
  discordIdentityCache?: {
    id: string;
    username: string;
    avatar: string | null;
    discriminator: string;
    global_name: string | null;
    banner: string | null;
    flags: number;
    premium_type?: number;
  };

  // Discord OAuth2  — store encrypted
  discord: {
    accessToken: string;      // ENCRYPTED
    refreshToken: string;     // ENCRYPTED
    expiresAt: Date;
    scope: string;
    email?: string;           // stored once, never leaked in public API
    locale?: string;
    verified?: boolean;
    mfa_enabled?: boolean;
    premium_type?: number;
  };

  // Patreon OAuth2  — store encrypted
  patreon?: {
    accessToken: string;      // ENCRYPTED
    refreshToken: string;     // ENCRYPTED
    expiresAt: Date;
    scope: string;
    identity?: {
      full_name: string;
      thumb_url: string;
      url: string;
      tier: string | null;
    };
  };

  // PII — IP geolocation block (was `personal`)
  // Separate field so it can be projected out or purged independently (GDPR)
  geo?: {
    ip: string;
    hostname?: string;
    city?: string;
    region?: string;
    country?: string;
    loc?: string;             // "lat,lng"
    org?: string;
    postal?: string;
    timezone?: string;
  };

  fetchedAt: Date;
}


// ─────────────────────────────────────────────────────────────
// 4. USER GUILDS  (new collection: `user_guilds`)
// ─────────────────────────────────────────────────────────────

/**
 * Preferred approach: store in Redis with a TTL, not Mongo.
 *
 *   redis key: `discord:guilds:<userId>`
 *   TTL:       6 hours  (users rarely change servers that quickly)
 *   value:     JSON array of UserGuild[]
 *
 * If you do need to persist to Mongo (for querying "all users in guild X"),
 * use one document per {userId, guildId} pair, NOT a whole embedded array.
 *
 * Index: { userId: 1 }, { guildId: 1 }    — supports both directions
 */
export interface UserGuild {
  _id?: ObjectId;
  userId: string;
  guildId: string;
  name: string;
  icon: string | null;
  banner: string | null;
  owner: boolean;
  permissions: number;
  permissions_new: string;
  features: string[];
  cachedAt: Date;           // for TTL-based cache invalidation
}

/*
 * If storing in Mongo, add a TTL index:
 *   UserGuildsSchema.index({ cachedAt: 1 }, { expireAfterSeconds: 21600 });
 *
 * This makes Mongo auto-prune stale cache entries without manual cleanup.
 * The `features` array should be stored as a compact integer bitmask once
 * you have a stable feature enum — it is currently ~30 strings per guild.
 */


// ─────────────────────────────────────────────────────────────
// 5. USER QUESTS  (new collection: `user_quests`)
// ─────────────────────────────────────────────────────────────

/**
 * One document per user+quest (NOT an array embedded in the user doc).
 * Index: { userId: 1, id: 1 } unique, { completed: 1 }
 *
 * Rationale: quest progress is written frequently but read rarely (only on
 * quest-tracking commands). It also grows unboundedly; embedding means every
 * profile read loads all historical quests.
 */
export interface UserQuest {
  _id: ObjectId;
  userId: string;
  questId: number;          // was `id`
  target: number;
  tracker: string;          // e.g. "play.*", "craft.id.commendtoken"
  progress: number;
  completed: boolean;
  completedAt?: Date;
}


// ─────────────────────────────────────────────────────────────
// 6. USER ANALYTICS  (new collection: `user_analytics`)
// ─────────────────────────────────────────────────────────────

/**
 * Write-heavy, read-rarely data that does not belong on the hot-path doc.
 * Index: { userId: 1 } unique
 */
export interface UserAnalytics {
  _id: ObjectId;
  userId: string;

  // Was counters.legacy
  legacy: {
    globalLV: number;
    globalXP: number;
  };

  // Was counters.dashThemeClicks — arbitrary per-theme click counts
  dashThemeClicks: Record<string, number>;

  // Was progression.craftingExp
  craftingExp: number;

  // Was modules.statistics — command/activity usage stats
  statistics?: Record<string, unknown>;
}


// ─────────────────────────────────────────────────────────────
// 7. USER LINKED ACCOUNTS  (new collection: `user_connections`)
// ─────────────────────────────────────────────────────────────

/**
 * Was `connections.*` on the user root — third-party service integrations.
 * Schema defines: discord (identity cache), lastfm, patreon (→ user_oauth),
 * twitter, spotify, twitch (future).  One document per {userId, type} pair.
 *
 * Also covers `discordData.connections[]` (battlenet, domain, etc.) from the
 * real payload — same shape, same collection.
 *
 * Index: { userId: 1 }, { userId: 1, type: 1, externalId: 1 } unique
 */
export interface UserConnection {
  _id: ObjectId;
  userId: string;
  // Known types from schema: "discord" | "lastfm" | "patreon" | "twitter" | "spotify" | "twitch"
  // Known types from discordData.connections[]: "battlenet" | "domain" | …
  type: string;
  externalId: string;       // was `id`
  name: string;
  verified: boolean;
  visibility: 0 | 1;
  show_activity: boolean;
  friend_sync: boolean;
  two_way_link: boolean;
  metadata_visibility: number;
  // lastfm-specific: username, playcount, etc. (stored as Extra)
  extra?: Record<string, unknown>;
}


// ─────────────────────────────────────────────────────────────
// MIGRATION NOTES
// ─────────────────────────────────────────────────────────────
/*
 * 1. NULL CLEANUP
 *    Before migrating medal/sticker inventories, run:
 *      db.users.updateMany({}, { $pull: { "modules.medalInventory":  null } })
 *      db.users.updateMany({}, { $pull: { "modules.stickerInventory": null } })
 *
 * 2. DEDUPLICATION
 *    prime.servers contains duplicate guild IDs:
 *      db.users.updateMany({}, [
 *        { $set: { "prime.servers": { $setUnion: ["$prime.servers", []] } } }
 *      ])
 *
 * 3. DEAD FIELD CLEANUP (safe to drop immediately)
 *    db.users.updateMany({}, { $unset: {
 *      "modules.rubinesOld": "",
 *      "modules.coins": "",
 *      "module": "",          // pending re-migration to user_cosmetics
 *      "EVTbkp": "",
 *      "eventTokens": "",     // consolidate into users.EVT
 *      "modules.daily": "",   // duplicate of counters.daily.last
 *    }})
 *
 * 4. TOKEN ENCRYPTION
 *    Encrypt all OAuth tokens BEFORE moving to user_oauth.
 *    AES-256-GCM recommended; store IV per-field alongside ciphertext.
 *    Never log, project, or include in API responses.
 *
 * 5. GUILD DATA → REDIS
 *    discordData.guilds[] should be moved to Redis immediately:
 *      redis.set(`discord:guilds:${userId}`, JSON.stringify(guilds), "EX", 21600)
 *    Drop the guilds field from Mongo once Redis is populated:
 *      db.users.updateMany({}, { $unset: { "discordData.guilds": "" } })
 *
 * 6. PHASE ORDER (to avoid downtime)
 *    Phase A — add new collections and write to both old + new in parallel.
 *    Phase B — migrate reads to new collections (feature-flagged).
 *    Phase C — verify correctness, then drop the now-redundant embedded arrays.
 *
 * 7. INDEX PLAN (Mongo commands)
 *    // users — preserve existing sparse unique index on personalhandle:
 *    db.users.createIndex({ personalhandle: 1 }, { unique: true, sparse: true })
 *    db.user_cosmetics.createIndex({ userId: 1 }, { unique: true })
 *    db.user_oauth.createIndex({ userId: 1 }, { unique: true })
 *    db.user_guilds.createIndex({ userId: 1 })
 *    db.user_guilds.createIndex({ guildId: 1 })
 *    db.user_guilds.createIndex({ cachedAt: 1 }, { expireAfterSeconds: 21600 })
 *    db.user_quests.createIndex({ userId: 1, questId: 1 }, { unique: true })
 *    db.user_analytics.createIndex({ userId: 1 }, { unique: true })
 *    db.user_connections.createIndex({ userId: 1, type: 1 }, { unique: true })
 *
 * 8. ESTIMATED SIZE REDUCTION (per user)
 *    bgInventory (~200 IDs × ~32 chars)       ≈  6.4 KB  → user_cosmetics
 *    medalInventory (~350 IDs × ~20 chars)    ≈  7 KB    → user_cosmetics
 *    stickerInventory (~200 IDs × ~20 chars)  ≈  4 KB    → user_cosmetics
 *    discordData.guilds (~80 × ~500 bytes)    ≈  40 KB   → Redis
 *    OAuth tokens + personal                  ≈  2 KB    → user_oauth
 *    --------------------------------------------------
 *    Total removed from hot-path doc          ≈  ~60 KB per user
 *    Expected hot-path doc size after          <  2 KB
 */
