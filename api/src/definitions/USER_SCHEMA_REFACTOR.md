# User Schema Refactor Proposal

> **Scope:** `userdb` collection — currently a monolithic document averaging **~60 KB** per user (4 800+ lines when serialised as JSON).  
> **Goal:** Split into 7 purpose-specific collections, enforce enums, drop dead fields, and fix security hazards.  
> **TypeScript reference:** [`User.refactor.proposal.ts`](User.refactor.proposal.ts)  
> **Date:** March 2026

---

## Table of Contents

1. [Why — Problems with the Current Document](#1-why--problems-with-the-current-document)
2. [Full Field Audit](#2-full-field-audit)
   - [Dead Fields](#21-dead-fields-safe-to-drop)
   - [Enum Candidates](#22-enum-candidates)
   - [Suspicious Patterns](#23-suspicious-patterns--bugs)
   - [Undeclared Ghost Fields](#24-undeclared-ghost-fields-strictfalse-drift)
3. [Proposed Schema Split (7 Collections)](#3-proposed-schema-split)
   - [users (core)](#31-users-core)
   - [user_cosmetics](#32-user_cosmetics)
   - [user_oauth](#33-user_oauth)
   - [user_guilds](#34-user_guilds)
   - [user_quests](#35-user_quests)
   - [user_analytics](#36-user_analytics)
   - [user_connections](#37-user_connections)
4. [Field Migration Map](#4-field-migration-map)
5. [Migration Plan](#5-migration-plan)
6. [Index Plan](#6-index-plan)
7. [Additional Improvements](#7-additional-improvements)

---

## 1. Why — Problems with the Current Document

### 1.1 Security Hazard 🔴

| Exposed Data | Current Location | Risk |
|---|---|---|
| Discord OAuth `accessToken` | `discordData.accessToken` | Plaintext on the same doc as public game data |
| Discord `refreshToken` | `discordData.refreshToken` | Same — enables full account takeover |
| Patreon `access_token` + `refresh_token` | `connections.patreon.*` | Plaintext |
| User email | `discordData.email` | PII stored permanently |
| IP + GPS coordinates | `personal.{ ip, loc, city, org, … }` | Full geolocation block on every user |

A single unprotected `find({})` leaks tokens + PII for the entire user base.

### 1.2 Document Size / Read Amplification

| Embedded Array | Typical Size | Loaded on Every Read? |
|---|---|---|
| `modules.bgInventory` | ~200 IDs × 32 chars ≈ **6.4 KB** | Yes |
| `modules.medalInventory` | ~350 entries (many nulls) ≈ **7 KB** | Yes |
| `modules.stickerInventory` | ~200 IDs ≈ **4 KB** | Yes |
| `discordData.guilds[]` | ~80 guild objects × ~500 B ≈ **40 KB** | Yes |
| OAuth tokens + personal | ≈ **2 KB** | Yes |
| **Total overhead** | **≈ 60 KB per user** | |

After the split, the hot-path core document drops to **< 2 KB**.

### 1.3 Schema Smell / Data Quality

- `null` entries scattered throughout `medalInventory` and `stickerInventory`.
- Duplicate guild IDs in `prime.servers`.
- `modules.daily` duplicated at `counters.daily.last`.
- `module` (singular) shadow-object coexists with `modules` (plural).
- `rubinesOld` — dead migration artefact still on every document.
- Three competing event-token counters: `modules.EVT`, `EVTbkp`, root `eventTokens`.
- `UserSchema` uses `{ strict: false }` — any `$set` with a typo silently creates a permanent ghost field.

### 1.4 Wrong Collection Boundaries

- `quests[]` grows unboundedly and is write-heavy, yet embedded.
- `discordData.guilds[]` is ephemeral cache data stored permanently.
- Analytics counters (`dashThemeClicks`, `legacy.globalXP`) share the hot path.

---

## 2. Full Field Audit

Cross-referenced across **bot** (`DEV/bot`), **dashboard** (`DEV/dashboard/src` + `dashboard/api/src`), **EVENT bot** (`EVENT/`), **database_schema**, and **internal_modules**.

### 2.1 Dead Fields (Safe to Drop)

Fields with **zero references** in both bot and dashboard production code:

| Field | Bot Hits | Dash Hits | Schema Status | Verdict |
|---|---|---|---|---|
| `spdaily` | 0 | 0 | `Mixed` | **DROP** |
| `rewardsMonth` | 0 | 0 | `Number` | **DROP** |
| `rewardsClaimed` | 0 | 0 | `Boolean` | **DROP** |
| `eventDaily` | 0 | 0 | `Number` | **DROP** |
| `eventTokens` (root) | 0 | 0 | undeclared (`strict:false`) | **DROP** — `modules.EVT` is the real counter |
| `donatorActive` | 0 | 0 | `String` | **DROP** — superseded by `prime.tier` |
| `hidden` | 0 | 0 (CSS only) | `Boolean` | **DROP** or repurpose |
| `modules.rep` | 0 | commented | `Number` | **DROP** — commends system replaced it |
| `modules.repdaily` | 0 | 0 | `Number` | **DROP** |
| `modules.PERMS` | 0 | 0 | `Number` | **DROP** — access checks use other mechanisms |
| `modules.stickerCollection` | 0 | 0 | `Array` | **DROP** — empty in production |
| `modules.fishes` | 0 | 0 | `Array` | **DROP** — empty in production |
| `modules.fishCollection` | 0 | 0 | `Array` | **DROP** — empty in production |
| `modules.fun` | 0 | 0 | `Mixed` | **DROP** — waifu/ship never shipped |
| `modules.statistics` | 0 | 0 | `Mixed` | **DROP** or → `user_analytics` |
| `modules.flairDown` | 0 | 0 | `String` | **DROP** — only `flairTop` is used |
| `connections.discord` | 0 | 0 | `Mixed` | **DROP** — identity cache moved to `user_oauth` |
| `connections.lastfm` | 0 | 0 | `Mixed` | **DROP** or → `user_connections` |
| `connections.twitter` | 0 | 0 | `Mixed` | **DROP** — "future" that never shipped |
| `connections.spotify` | 0 | 0 | `Mixed` | **DROP** |
| `connections.twitch` | 0 | 0 | `Mixed` | **DROP** |
| `prime.misc` | 0 | 0 | `Mixed` | **DROP** |
| `prime.lastClaimed` | 1 (bot) | 0 | `Number` | Review — used only in claim flow |
| `prime.canReallocate` | 1 (bot) | 0 | `Boolean` | Review — used only in prime admin |
| `prime.custom_handle` | 1 (bot) | 0 | `Boolean` | Review |
| `prime.custom_shop` | 1 (bot) | 0 | `Boolean` | Review |
| `modules.coins` | 0 | 0 | undeclared | **DROP** — zeroed dead currency |
| `rubinesOld` | 0 | 0 | undeclared | **DROP** — migration artefact |
| `EVTbkp` | 0 | 0 | undeclared | **DROP** |
| `modules.daily` | 0 | 0 | undeclared | **DROP** — duplicate of `counters.daily.last` |
| `module` (singular) | 0 | 0 | undeclared | **DROP** — shadow object, migrate items first |
| `partner` | 0 | 0 | commented out | **DROP** |
| `polluxmod` | 0 | 0 | commented out | **DROP** |
| `modules.commend` / `.commended` | 0 | 0 | typed in d.ts | **DROP** — replaced by `commends` collection |

**Total dead fields: ~30 (≈ 37% of all schema fields)**

### 2.2 Enum Candidates

#### `donator` / `prime.tier` — Subscription Tier

Currently a bare `String` with no validation. Three conflicting type definitions exist:

| Source | Values |
|---|---|
| `database_schema/index.d.ts` `Donator` type | `plastic`, `aluminium`, `iron`, `carbon`, `lithium`, `iridium`, `palladium`, `zircon`, `uranium`, `xastatine`, `antimatter`, `neutrino` (12) |
| `dashboard/api PrimeTier` type | `Aluminium`, `Carbon`, `Iridium`, `Lithium`, `Neutrino`, `Platinum`, `Uranium`, `Zircon`, `Astatine` (9) |
| `dashboard/api PrimeTiersEnum` | `uranium`, `antimatter`, `aluminium`, `plastic`, `astatine`, `iridium`, `zircon`, `lithium`, `carbon`, `neutrino` (10) |

**Problems:**
- `xastatine` vs `astatine` — likely a typo in the d.ts
- `iron`, `palladium` in d.ts but missing from dashboard — removed tiers?
- `platinum` in dashboard but missing from d.ts — new tier?
- `antimatter` in enum but not in `PrimeTier` union
- Casing inconsistent: d.ts uses lowercase, dashboard uses Title Case

**Recommendation:** Single source of truth as a Mongoose `enum` validator + TypeScript const:

```typescript
export const PRIME_TIERS = [
  "plastic", "aluminium", "carbon", "lithium", "iridium",
  "palladium", "zircon", "uranium", "astatine", "antimatter", "neutrino"
] as const;
export type PrimeTier = (typeof PRIME_TIERS)[number];
```

#### `blacklisted` — Ban Reason String

Used in three conflicting patterns:
- **Existence check:** `{ blacklisted: { $exists: true } }`
- **Non-empty string:** `blacklisted && blacklisted != ""`
- **String value `"false"`:** `blacklisted != "false"`

Known values written by code:
- `"XSS Attempt - Shop [${item}]"`
- `"XSS Attempt - BGShop [${item}]"`
- `"XSS Attempt - MedalShop [${item}]"`
- `"BOT ACCOUNT"`
- `""` (empty string = not banned)
- `"false"` (string literal — bug)

**Recommendation:** Convert to `{ banned: boolean, banReason?: string }` or use `null` / absent = not banned.

#### `switches.role` — Staff Role Badge

Known values: `"translator"`, `"artist"`

**Recommendation:** `enum SwitchRole { translator = "translator", artist = "artist" }`

#### `switches.flagOverride` — Country Flag Override

Known values: `"hidden"` (suppress flag), or an ISO country code string.

#### `modules.skins.*` — Skin Per-Feature

Known keys: `blackjack`. Values: `"default"` or a deck localiser string.

#### Currencies

The schema declares 4 currencies explicitly, but 4 more exist via `strict: false`:

| Code | Full Name | Declared in Schema? | Used? |
|---|---|---|---|
| `RBN` | Rubines | ✅ Yes (with default 500, indexed) | ✅ Heavy |
| `JDE` | Jades | ✅ Yes (with default 2500, indexed) | ✅ Heavy |
| `SPH` | Sapphires | ✅ Yes (indexed) | ✅ Heavy |
| `EVT` | Event Tokens | ✅ Yes (indexed) | ✅ Active |
| `PSM` | Prisms | ❌ **Not in schema** | ✅ Active (daily booster reward) |
| `AMY` | Amethysts | ❌ Not in schema | ⚠️ Test factory only |
| `EMD` | Emeralds | ❌ Not in schema | ⚠️ Test factory only |
| `TPZ` | Topazes | ❌ Not in schema | ⚠️ Test factory only |

**PSM** is actively awarded daily to Discord Server Boosters:
$$PSM = \min\left(\left\lfloor 5 + \frac{\text{days since boost}}{10}\right\rfloor,\ 150\right)$$

**Recommendation:** Declare all active currencies in the schema with defaults and indices. Drop `AMY`/`EMD`/`TPZ` if they have no production writes.

#### Relationship `ring` Type

From the `relationships` collection (in `_misc.js`):

```typescript
type RingType = "jade" | "sapphire" | "stardust" | "rubine";
```

#### Relationship `type`

```typescript
type RelationshipType = "marriage" | "parents" | "children";
```

### 2.3 Suspicious Patterns / Bugs

#### 🔴 `donator` vs `prime.tier` — Split-Brain Reads

`prime.tier` is the canonical new field (written by `Premium.js`). The migration command `primerollout` nulls out `donator`. But multiple commands **still read `donator`**:

| Consumer | Access |
|---|---|
| `daily.js` | `userData.donator` → powerup icon + bonus rubines lookup |
| `betflip.js` | `userData.donator` → premium feature gate |
| `UserProfileModel.js` | `userDBData.donator` → profile frame image path |
| `Premium.js` (structures) | `usr.donator` → tier resolution |
| `Premium.js` (archetypes) | `usr.prime?.tier \|\| usr.donator` → fallback |

After `primerollout` nulls `donator`, these all return `null/undefined` — **breaking premium features** for migrated users.

**Fix:** Replace all `userData.donator` reads with `userData.prime?.tier ?? userData.donator` during transition, then remove `donator` entirely.

#### 🔴 `DB.userDB` vs `DB.users` — Dual Model Handles

Two different accessors write to the same `userdb` collection:
- `DB.userDB.set(...)` — used in `personaltext.js`, `tagline.js`
- `DB.users.set(...)` — used everywhere else

If these have different middleware or caching, writes via `userDB` bypass guardrails.

#### 🟡 `blacklisted` — Boolean/String/Existence Confusion

Three conflicting access patterns (see [Enum Candidates](#22-enum-candidates) above).

#### 🟡 `modules.lovepoints` — Split Between User and Marriage

`mrgt.js` divides `USERDATA.modules.lovepoints` by marriage count to distribute to individual `relationships.lovepoints`. The `UserProfileModel.js` reads `marriage.lovepoints` from the relationship doc. Data can get out of sync.

#### 🟡 `upCommend()` — Argument Count Mismatch

`UserSchema.methods.upCommend(USER, amt)` calls `commends.add(this.id, USER.id, amt)` but `commends.add()` only accepts 2 args `(idFrom, idTo)` — the `amt` parameter is silently ignored.

#### 🟡 `utils.dbChecker` — Broken Method

References undefined variables `alter` and `resolve`. Will throw `ReferenceError` on every invocation. Mixed into every model via `MODEL.check = utils.dbChecker`.

#### ℹ️ `progression` — Server Field Mis-declared on User

Despite being in the user schema, `progression` is only ever accessed on **server documents** (`SV_DB.progression`, `serverData.progression`). If it exists on user docs, it's dead weight.

### 2.4 Undeclared Ghost Fields (`strict:false` Drift)

Because `UserSchema` uses `{ strict: false }`, Mongoose does not strip unknown fields. These exist on real documents **without schema declarations**:

| Ghost Field | How It Got There | Status |
|---|---|---|
| `modules.PSM` | Written by `timed-usage/daily.ts` via `$inc` | **Active** — needs to be declared |
| `modules.coins` | Legacy currency, later zeroed | Dead |
| `modules.rubinesOld` | Migration artefact | Dead |
| `modules.daily` | Legacy timestamp, duplicated by `counters.daily.last` | Dead |
| `EVTbkp` | Event token backup | Dead |
| `eventTokens` | Root-level duplicate of `modules.EVT` | Dead |
| `module` (singular) | New inventory system shadow | Dead |
| `switches.*` (many subkeys) | Written by bot + dashboard ad-hoc | Active but untyped |

**Risk:** Any `$set` typo (e.g., `modules.psm` instead of `modules.PSM`) creates a permanent ghost field on every affected user document. There is no validation.

---

## 3. Proposed Schema Split

### Overview

| # | Collection | Cardinality | Indices | Replaces |
|---|---|---|---|---|
| 1 | `users` | 1 per user | `id` (unique), `personalhandle` (unique sparse) | Lean core doc |
| 2 | `user_cosmetics` | 1 per user | `userId` (unique) | All `*Inventory` arrays |
| 3 | `user_oauth` | 1 per user | `userId` (unique) | OAuth tokens + PII |
| 4 | `user_guilds` | Redis preferred | `userId`, `guildId`, TTL | `discordData.guilds` |
| 5 | `user_quests` | N per user | `userId + questId` (unique) | `quests[]` |
| 6 | `user_analytics` | 1 per user | `userId` (unique) | Stats, legacy XP, theme clicks |
| 7 | `user_connections` | N per user | `userId + type` (unique) | `connections.*`, `discordData.connections[]` |

### 3.1 `users` (Core)

The hot-path document. **Rule: if it is not needed to render the profile card or run a command, it does NOT live here.**

```typescript
interface UserCore {
  _id: ObjectId;
  id: string;                    // Discord snowflake (unique index)
  name: string;
  tag: string;
  avatar: string | null;
  banner: string | null;
  personalhandle?: string;       // unique sparse index

  // Progression
  level: number;
  exp: number;
  rep: number;
  repdaily: number;

  // Currencies (all declared with defaults + indices)
  RBN: number;                   // Rubines (default 500)
  SPH: number;                   // Sapphires
  JDE: number;                   // Jades (default 2500)
  PSM: number;                   // Prisms — NOW DECLARED
  EVT: number;                   // Event tokens (single source of truth)
  cherries: number;
  lovepoints: number;

  // Active cosmetic slots (small — equipped state only)
  profile: {
    bgID: string | null;
    flairTop: string | null;
    sticker: string | null;
    favcolor: string;            // hex, e.g. "#eb497b"
    persotext: string;
    tagline: string;
    medals: string[];            // max 9 equipped slots
    skins: Record<string, string>;
  };

  // Subscription
  donator: PrimeTier | null;     // legacy — read-only after migration
  donatorActive: PrimeTier | null;
  prime: {
    active: boolean;
    tier: PrimeTier | null;
    maxServers: number;
    lastClaimed: number;
    servers: string[];           // de-duplicated guild IDs
    canReallocate: boolean;
    custom_background: boolean;
    custom_handle: boolean;
    custom_shop: boolean;
  } | null;

  // Access control
  PERMS: number;
  blacklisted?: string;          // reason string, absent = not banned
  hidden?: boolean;

  // Preferences
  switches: {
    favServers: string[];
    dashTheme: string;
    booruPublic: boolean;
    booruSlots: number;
    flagOverride?: string;
    profileFrame?: boolean;
    role?: "translator" | "artist";
    translator?: string;          // ISO country code for translator flag
    badges?: unknown[];
    notifications?: Record<string, unknown>;
    channeldeck?: string[];
    LVUPDMoptout?: boolean;
    hideProle?: boolean;
    rankFrozen?: boolean;
    variables?: Array<{ tag: string; value: string }>;
    custom_rt?: { seed: number; items: string[] };
    donateStreak?: { total: number; [tier: string]: number };
  };

  // Counters (time-sensitive)
  counters: {
    daily: { last: number; streak: number; lastStreak: number; highest: number; insured: boolean };
    prime_streak: Record<string, number>;
    transfer_box: { last: number };
    thx: { last: number; lastStreak: number | null };
    commend: { last: number; lastStreak: number | null };
    transfer_rbn: { last: number; lastStreak: number | null };
    errands: { last: number };
    cross_server_box_attempts: number;
    hearts: string[];
  };

  // Social
  married: string[];
  featuredMarriage: string | null;

  // Event (ephemeral, purged post-event)
  eventData?: Record<string, unknown>;
  eventGoodie?: number;

  // Misc
  limits?: Record<string, unknown>;
  cherrySet?: Record<string, unknown>;
  powerups?: Record<string, unknown>;
  fun?: { waifu?: unknown; lovers?: unknown; shiprate?: unknown };
  lastUpdated: Date;
  migrated: boolean;
}
```

### 3.2 `user_cosmetics`

One document per user. All large inventory arrays.

```typescript
interface UserCosmetics {
  _id: ObjectId;
  userId: string;               // FK → users.id (unique index)

  inventory: Array<{ id: string; count: number; crafted?: number }>;
  bgInventory: string[];
  skinInventory: string[];
  flairsInventory: string[];
  medalInventory: string[];     // nulls stripped on migration
  stickerInventory: string[];
  stickerCollection: string[];
  fishes: string[];
  fishCollection: string[];
  achievements: string[];
  cherryCosmetics?: string[];
}
```

### 3.3 `user_oauth`

One document per user. **Encrypted at rest. Separate MongoDB role.**

```typescript
interface UserOAuth {
  _id: ObjectId;
  userId: string;               // FK → users.id (unique index)

  discordIdentityCache?: {
    id: string; username: string; avatar: string | null;
    discriminator: string; global_name: string | null;
    banner: string | null; flags: number; premium_type?: number;
  };

  discord: {
    accessToken: string;        // AES-256-GCM ENCRYPTED
    refreshToken: string;       // AES-256-GCM ENCRYPTED
    expiresAt: Date;
    scope: string;
    email?: string;
    locale?: string;
    verified?: boolean;
    mfa_enabled?: boolean;
    premium_type?: number;
  };

  patreon?: {
    accessToken: string;        // ENCRYPTED
    refreshToken: string;       // ENCRYPTED
    expiresAt: Date;
    scope: string;
    identity?: { full_name: string; thumb_url: string; url: string; tier: string | null };
  };

  // PII — GDPR purgeable independently
  geo?: {
    ip: string; hostname?: string; city?: string; region?: string;
    country?: string; loc?: string; org?: string; postal?: string; timezone?: string;
  };

  fetchedAt: Date;
}
```

### 3.4 `user_guilds`

**Preferred: Redis only** (`discord:guilds:<userId>`, TTL 6h).

If Mongo persistence is needed:

```typescript
interface UserGuild {
  userId: string;
  guildId: string;
  name: string;
  icon: string | null;
  banner: string | null;
  owner: boolean;
  permissions: number;
  permissions_new: string;
  features: string[];
  cachedAt: Date;               // TTL index: expireAfterSeconds 21600
}
```

### 3.5 `user_quests`

One document per user + quest (not an embedded array).

```typescript
interface UserQuest {
  _id: ObjectId;
  userId: string;
  questId: number;
  target: number;
  tracker: string;              // e.g. "play.*", "craft.id.commendtoken"
  progress: number;
  completed: boolean;
  completedAt?: Date;
}
```

### 3.6 `user_analytics`

Write-heavy, read-rarely.

```typescript
interface UserAnalytics {
  _id: ObjectId;
  userId: string;               // unique index

  legacy: { globalLV: number; globalXP: number };
  dashThemeClicks: Record<string, number>;
  craftingExp: number;
  statistics?: Record<string, unknown>;
}
```

### 3.7 `user_connections`

Third-party linked accounts from both `connections.*` and `discordData.connections[]`.

```typescript
interface UserConnection {
  _id: ObjectId;
  userId: string;
  type: string;                 // "lastfm" | "battlenet" | "domain" | "twitch" | …
  externalId: string;
  name: string;
  verified: boolean;
  visibility: 0 | 1;
  show_activity: boolean;
  friend_sync: boolean;
  two_way_link: boolean;
  metadata_visibility: number;
  extra?: Record<string, unknown>;  // lastfm-specific fields, etc.
}
```

---

## 4. Field Migration Map

### Moved to `user_cosmetics`

| Old Path | New Path |
|---|---|
| `modules.inventory` | `user_cosmetics.inventory` |
| `modules.bgInventory` | `user_cosmetics.bgInventory` |
| `modules.medalInventory` | `user_cosmetics.medalInventory` |
| `modules.stickerInventory` | `user_cosmetics.stickerInventory` |
| `modules.flairsInventory` | `user_cosmetics.flairsInventory` |
| `modules.skinInventory` | `user_cosmetics.skinInventory` |
| `modules.stickerCollection` | `user_cosmetics.stickerCollection` |
| `modules.fishCollection` | `user_cosmetics.fishCollection` |
| `modules.fishes` | `user_cosmetics.fishes` |
| `modules.achievements` | `user_cosmetics.achievements` |

### Moved to `user_oauth` (encrypted)

| Old Path | New Path |
|---|---|
| `discordData.accessToken` | `user_oauth.discord.accessToken` |
| `discordData.refreshToken` | `user_oauth.discord.refreshToken` |
| `discordData.email` | `user_oauth.discord.email` |
| `connections.patreon.access_token` | `user_oauth.patreon.accessToken` |
| `connections.patreon.refresh_token` | `user_oauth.patreon.refreshToken` |
| `connections.discord` (identity blob) | `user_oauth.discordIdentityCache` |
| `personal.*` | `user_oauth.geo.*` |

### Moved to `user_connections`

| Old Path | New Path |
|---|---|
| `discordData.connections[]` | One `user_connections` doc per linked account |
| `connections.lastfm` | `user_connections { type: "lastfm" }` |
| `connections.twitter` | `user_connections { type: "twitter" }` |
| `connections.spotify` | `user_connections { type: "spotify" }` |
| `connections.twitch` | `user_connections { type: "twitch" }` |

### Moved to `user_analytics`

| Old Path | New Path |
|---|---|
| `counters.legacy.{ globalLV, globalXP }` | `user_analytics.legacy` |
| `counters.dashThemeClicks` | `user_analytics.dashThemeClicks` |
| `progression.craftingExp` | `user_analytics.craftingExp` |
| `modules.statistics` | `user_analytics.statistics` |

### Moved to `user_guilds` / Redis

| Old Path | New Path |
|---|---|
| `discordData.guilds[]` | Redis `discord:guilds:<userId>` (TTL 6h) |

### Moved to `user_quests`

| Old Path | New Path |
|---|---|
| `quests[]` (embedded array) | One `user_quests` doc per quest |

### Folded into `UserCore` (relocated, not split)

| Old Path | New Location |
|---|---|
| `modules.level` / `modules.exp` | `users.level` / `users.exp` |
| `modules.lovepoints` | `users.lovepoints` |
| `modules.powerups` | `users.powerups` |
| `modules.fun` | `users.fun` |
| `meta.{ tag, avatar, … }` | `users.name` / `users.avatar` / `users.tag` |

### Dropped (Dead Data)

```js
db.users.updateMany({}, { $unset: {
  "modules.rubinesOld":    "",
  "modules.coins":         "",
  "modules.daily":         "",    // duplicate of counters.daily.last
  "modules.flairDown":     "",    // unused — only flairTop is read
  "modules.rep":           "",    // replaced by commends collection
  "modules.repdaily":      "",
  "modules.PERMS":         "",    // dead
  "modules.stickerCollection": "", // empty
  "modules.fishes":        "",    // empty
  "modules.fishCollection":"",    // empty
  "modules.fun":           "",    // waifu/ship never shipped
  "modules.statistics":    "",    // dead or → analytics
  "modules.commend":       "",    // replaced by commends collection
  "modules.commended":     "",
  "module":                "",    // singular shadow object
  "EVTbkp":                "",
  "eventTokens":           "",    // → users.EVT
  "donatorActive":         "",    // → prime.tier
  "spdaily":               "",
  "rewardsMonth":          "",
  "rewardsClaimed":        "",
  "eventDaily":            "",
  "hidden":                "",
  "partner":               "",
  "polluxmod":             "",
  "prime.misc":            "",
  "connections.discord":   "",    // → user_oauth
  "connections.twitter":   "",    // never implemented
  "connections.spotify":   "",    // never implemented
  "connections.twitch":    "",    // never implemented
  "progression":           "",    // server field, not user field
}})
```

---

## 5. Migration Plan

### Phase A — Parallel Writes (no downtime)

1. Create new collections with indices.
2. Deploy updated write paths that write to **both** old embedded fields and new collections.
3. Run backfill script to populate new collections from existing documents.

### Phase B — Feature-Flagged Reads

1. Add feature flag: `USE_SPLIT_SCHEMA=true`.
2. Gradually switch read paths to new collections behind the flag.
3. Monitor for data consistency.

### Phase C — Cleanup

1. Verify correctness for ≥ 1 week.
2. Drop the now-redundant embedded arrays and fields.
3. Remove legacy write paths.
4. Enable `strict: true` on `UserSchema`.

### Pre-Migration Data Cleanup

```js
// 1. Strip nulls from inventory arrays
db.users.updateMany({}, { $pull: { "modules.medalInventory": null } })
db.users.updateMany({}, { $pull: { "modules.stickerInventory": null } })

// 2. De-duplicate prime.servers
db.users.updateMany({}, [
  { $set: { "prime.servers": { $setUnion: ["$prime.servers", []] } } }
])

// 3. Encrypt tokens BEFORE copying to user_oauth
//    AES-256-GCM, store IV per-field alongside ciphertext

// 4. Move guilds to Redis
//    redis.set(`discord:guilds:${userId}`, JSON.stringify(guilds), "EX", 21600)
//    Then: db.users.updateMany({}, { $unset: { "discordData.guilds": "" } })
```

---

## 6. Index Plan

```js
// users (keep existing + add)
db.users.createIndex({ id: 1 },              { unique: true })
db.users.createIndex({ personalhandle: 1 },  { unique: true, sparse: true })
db.users.createIndex({ "modules.PSM": 1 })   // if PSM stays under modules during transition

// New collections
db.user_cosmetics.createIndex(  { userId: 1 },                          { unique: true })
db.user_oauth.createIndex(      { userId: 1 },                          { unique: true })
db.user_guilds.createIndex(     { userId: 1 })
db.user_guilds.createIndex(     { guildId: 1 })
db.user_guilds.createIndex(     { cachedAt: 1 },                        { expireAfterSeconds: 21600 })
db.user_quests.createIndex(     { userId: 1, questId: 1 },              { unique: true })
db.user_analytics.createIndex(  { userId: 1 },                          { unique: true })
db.user_connections.createIndex( { userId: 1, type: 1 },                { unique: true })
```

---

## 7. Additional Improvements

### 7.1 Enable `strict: true`

The current `{ strict: false }` on `UserSchema` is the root cause of ghost fields. After migration, switch to `strict: true` and declare every field explicitly. Any ad-hoc `$set` with a typo will then throw instead of silently persisting.

### 7.2 Unify `donator` / `prime.tier` Reads

During transition, replace all bare `userData.donator` reads with:

```js
const tier = userData.prime?.tier ?? userData.donator;
```

Post-migration, remove `donator` entirely from the schema.

### 7.3 Declare PSM in Schema

```js
PSM: { type: Number, default: 0, index: true },
```

### 7.4 Fix `upCommend()` Argument Mismatch

`commends.add(idFrom, idTo)` ignores the third `amt` parameter. Either fix `add()` to accept an amount or remove the `amt` argument from `upCommend()`.

### 7.5 Fix `utils.dbChecker`

The method references undefined `alter` and `resolve`. It's broken and mixed into every model. Either fix or remove it.

### 7.6 Unify `DB.userDB` / `DB.users`

Ensure a single model handle writes to `userdb`. Remove the alternate accessor.

### 7.7 Normalize `blacklisted`

Replace string-as-boolean pattern with:

```typescript
banned: { type: Boolean, default: false, index: true },
banReason: { type: String },
```

### 7.8 `switches` Sub-Schema

The `switches` field is `Mixed` — any key can be written. Full list of known subkeys discovered across all codebases:

| Subkey | Type | Used By |
|---|---|---|
| `badges` | `unknown[]` | Bot profile (sidebar badge display) |
| `booruPublic` | `boolean` | Dashboard (booru visibility toggle) |
| `booruSlots` | `number` | Dashboard (booru slot count) |
| `channeldeck` | `string[]` | Bot (`+chdeck` command) |
| `custom_rt` | `{ seed, items[] }` | Dashboard (custom rotating shop) |
| `dashTheme` | `string` | Dashboard (theme preference) |
| `donateStreak` | `{ total, [tier]: n }` | Bot migration, dashboard donator listing |
| `favServers` | `string[]` | Dashboard (favorite servers list) |
| `flagOverride` | `string` | Bot profile (country flag override or `"hidden"`) |
| `hideProle` | `boolean` | Bot (hide profile from public) |
| `LVUPDMoptout` | `boolean` | Bot (opt out of level-up DMs) |
| `migrateFix` | `{ inv, marry }` | Bot migration (one-time fix flags) |
| `notifications` | `Record<string, unknown>` | Dashboard (notification prefs) |
| `profileFrame` | `boolean` | Bot + Dashboard (toggle profile frame) |
| `profiled` | `boolean` | Bot (profile completion flag) |
| `rankFrozen` | `boolean` | Bot migration (freeze rank during migration) |
| `role` | `"translator" \| "artist"` | Bot (staff role badge) |
| `tokensMigrated` | `boolean` | Bot migration (one-time flag) |
| `translator` | `string` | Bot (ISO country code for translator flag) |
| `variables` | `Array<{ tag, value }>` | Bot + Dashboard (custom RP attributes) |

**Recommendation:** Define a proper sub-schema instead of `Mixed`. One-time migration flags (`migrateFix`, `tokensMigrated`, `rankFrozen`) can be dropped after verifying all users are migrated.

### 7.9 Relationship Schema Improvements

The `relationships` collection in `_misc.js` should:

- Add a `ring` enum: `{ type: String, enum: ["jade", "sapphire", "stardust", "rubine"] }`
- Add a `type` enum: `{ type: String, enum: ["marriage", "parents", "children"] }`
- Get its own schema file instead of being buried in `_misc.js`

### 7.10 Estimated Impact

| Metric | Before | After |
|---|---|---|
| Hot-path document size | ~60 KB | < 2 KB |
| Fields on core document | ~70 explicit + ghost | ~35 typed |
| Plaintext OAuth tokens | 3 | 0 |
| `strict: false` on users | Yes | **No** |
| Dead fields carried per user | ~30 | 0 |
| Schema-declared currencies | 4/8 | 8/8 |
