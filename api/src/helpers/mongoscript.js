// mongoscript.js
// Paste this into a mongo / mongosh session (or Studio 3T shell).
// Each block migrates one portion of the user document to the new
// collection. They are idempotent and can be rerun if needed.

// pre-create indexes required by Atlas when using $out
print('creating required indexes');
db.users.createIndex({ id: 1 }, { unique: true });
db.users.createIndex({ personalhandle: 1 }, { unique: true, sparse: true });
db.user_inventory.createIndex({ userId: 1 }, { unique: true });
db.user_oauth.createIndex({ userId: 1 }, { unique: true });
db.user_guilds.createIndex({ userId: 1 });
db.user_guilds.createIndex({ guildId: 1 });
// required for $merge on both fields to be treated as unique
// Atlas wants a unique index for the join pair
db.user_guilds.createIndex({ userId: 1, guildId: 1 }, { unique: true });
db.user_quests.createIndex({ userId: 1, questId: 1 }, { unique: true });
// Atlas requires the _id field to be indexed when using $out
db.user_quests.createIndex({ _id: 1 }, { unique: true });
db.user_analytics.createIndex({ userId: 1 }, { unique: true });
db.user_connections.createIndex({ userId: 1, type: 1 }, { unique: true });

// 1. users core
print('migrating users core');
db.userdb.aggregate([
  {
    $project: {
      id: "$id",
      name: { $ifNull: ["$name", "$meta.tag"] },
      tag: { $ifNull: ["$tag", "$meta.tag"] },
      avatar: {
        $ifNull: [
          { $ifNull: ["$meta.avatar", "$avatar"] },
          null
        ]
      },
      personalhandle: {
        $cond: [{ $eq: ["$personalhandle", null] }, "$$REMOVE", "$personalhandle"]
      },
      currency: {
        RBN: {
          $ifNull: [
            { $ifNull: ["$modules.RBN", "$RBN"] },
            0
          ]
        },
        SPH: {
          $ifNull: [
            { $ifNull: ["$modules.SPH", "$SPH"] },
            0
          ]
        },
        JDE: {
          $ifNull: [
            { $ifNull: ["$modules.JDE", "$JDE"] },
            0
          ]
        },
        PSM: "$modules.PSM",
        EVT: {
          $ifNull: [
            "$modules.EVT",
            { $ifNull: ["$eventTokens", "$eventGoodie"] }
          ]
        }
      },
      profile: {
        featuredMarriage: "$featuredMarriage",
        bgID: {
          $ifNull: [
            { $ifNull: ["$profile.bgID", "$modules.bg"] },
            null
          ]
        },
        flairTop: "$profile.flairTop",
        sticker: "$profile.sticker",
        favcolor: {
          $ifNull: ["$profile.favcolor", "#000000"]
        },
        persotext: "$profile.persotext",
        tagline: "$profile.tagline",
        medals: "$profile.medals",
        skins: "$modules.skins"
      },
      progression: {
        level: {
          $ifNull: [
            { $ifNull: ["$modules.level", "$level"] },
            0
          ]
        },
        exp: {
          $ifNull: [
            { $ifNull: ["$modules.exp", "$exp"] },
            0
          ]
        },
        globalLV: "$progression.globalLV",
        globalXP: "$progression.globalXP",
        craftingExp: "$progression.craftingExp"
      },
      meta: {
        createdAt: {
          $ifNull: ["$meta.createdAt", { $toDate: "$_id" }]
        },
        lastLogin: { $ifNull: ["$meta.lastLogin", new Date(0)] },
        lastUpdated: "$lastUpdated",
        migrated: true
      },
      prime: 1,
      blacklisted: 1,
      switches: 1,
      counters: 1,
      eventData: 1
    }
  },
  {
    $merge: {
      into: "users",
      on: "id",
      whenMatched: "replace",
      whenNotMatched: "insert"
    }
  }
]);

// 2. user_inventory
print('migrating user_inventory');
db.userdb.aggregate([
  {
    $project: {
      userId: "$id",
      inventory: "$modules.inventory",
      bgInventory: "$modules.bgInventory",
      skinInventory: "$modules.skinInventory",
      flairInventory: "$modules.flairsInventory",
      medalInventory: {
        $filter: { input: "$modules.medalInventory", cond: { $ne: ["$$this", null] } }
      },
      stickerInventory: {
        $filter: { input: "$modules.stickerInventory", cond: { $ne: ["$$this", null] } }
      },
      stickerShowcase: "$modules.stickerCollection",
      fishes: "$modules.fishes",
      fishShowcase: "$modules.fishCollection",
      achievements: "$modules.achievements"
    }
  },
  {
    $merge: {
      into: "user_inventory",
      on: "userId",
      whenMatched: "replace",
      whenNotMatched: "insert"
    }
  }
]);

// 3. user_oauth
print('migrating user_oauth');
db.userdb.aggregate([
  {
    $project: {
      userId: "$id",
      discordIdentityCache: {
        $cond: [
          { $ifNull: ["$discordData.id", false] },
          {
            id: "$discordData.id",
            username: "$discordData.username",
            avatar: "$discordData.avatar",
            discriminator: "$discordData.discriminator",
            global_name: "$discordData.global_name",
            banner: "$discordData.banner",
            flags: "$discordData.flags",
            premium_type: "$discordData.premium_type"
          },
          "$$REMOVE"
        ]
      },
      discord: {
        accessToken: "$discordData.accessToken",
        refreshToken: "$discordData.refreshToken",
        expiresAt: "$discordData.expiresAt",
        scope: "$discordData.scope",
        email: "$discordData.email",
        locale: "$discordData.locale",
        verified: "$discordData.verified",
        mfa_enabled: "$discordData.mfa_enabled",
        premium_type: "$discordData.premium_type"
      },
      patreon: {
        $cond: [
          { $ifNull: ["$connections.patreon", false] },
          {
            accessToken: "$connections.patreon.access_token",
            refreshToken: "$connections.patreon.refresh_token",
            expiresAt: {
              $cond: [
                { $ifNull: ["$connections.patreon.expires_in", false] },
                { $add: ["$$NOW", { $multiply: ["$connections.patreon.expires_in", 1000] }] },
                null
              ]
            },
            scope: "$connections.patreon.scope",
            identity: "$connections.patreon.identity"
          },
          "$$REMOVE"
        ]
      },
      geo: "$personal",
      fetchedAt: "$$NOW"
    }
  },
  {
    $merge: {
      into: "user_oauth",
      on: "userId",
      whenMatched: "replace",
      whenNotMatched: "insert"
    }
  }
]);

// 4. user_guilds
print('migrating user_guilds');
db.userdb.aggregate([
  { $unwind: "$discordData.guilds" },
  {
    $project: {
      // discard the original document _id so each guild gets a fresh id
      _id: "$$REMOVE",
      userId: "$id",
      guildId: "$discordData.guilds.id",
      name: "$discordData.guilds.name",
      icon: "$discordData.guilds.icon",
      banner: "$discordData.guilds.banner",
      owner: "$discordData.guilds.owner",
      permissions: "$discordData.guilds.permissions",
      permissions_new: "$discordData.guilds.permissions_new",
      features: "$discordData.guilds.features",
      cachedAt: "$$NOW"
    }
  },
  {
    $merge: {
      into: "user_guilds",
      on: ["userId", "guildId"],
      whenMatched: "replace",
      whenNotMatched: "insert"
    }
  }
]);

// 5. user_quests
print('atlas migrate user_quests');
db.userdb.aggregate([
  { $unwind: "$quests" },
  {
    $project: {
      _id: { $concat: ["$id", "_", { $toString: "$quests.id" }] },
      userId: "$id",
      questId: "$quests.id",
      target: "$quests.target",
      tracker: "$quests.tracker",
      progress: "$quests.progress",
      completed: "$quests.completed",
      completedAt: "$quests.completedAt"
    }
  },
  { $out: "user_quests" }
]);

// 6. user_analytics
print('migrating user_analytics');
db.userdb.aggregate([
  {
    $project: {
      userId: "$id",
      legacy: {
        globalLV: "$progression.globalLV",
        globalXP: "$progression.globalXP"
      },
      dashThemeClicks: "$counters.dashThemeClicks",
      statistics: "$modules.statistics"
    }
  },
  {
    $merge: {
      into: "user_analytics",
      on: "userId",
      whenMatched: "replace",
      whenNotMatched: "insert"
    }
  }
]);

// 7. user_connections
print('migrating user_connections');
db.userdb.aggregate([
  {
    $project: {
      userId: "$id",
      conns: {
        $concatArrays: [
          { $ifNull: ["$discordData.connections", []] },
          { $cond: [{ $ifNull: ["$connections.lastfm", false] },
            [{
              type: "lastfm",
              id: "$connections.lastfm.id",
              name: "$connections.lastfm.name",
              verified: "$connections.lastfm.verified",
              visibility: "$connections.lastfm.visibility",
              show_activity: "$connections.lastfm.show_activity",
              friend_sync: "$connections.lastfm.friend_sync",
              two_way_link: "$connections.lastfm.two_way_link",
              metadata_visibility: "$connections.lastfm.metadata_visibility",
              extra: "$connections.lastfm"
            }], [] ] },
          { $cond: [{ $ifNull: ["$connections.twitter", false] },
            [{ type: "twitter", extra: "$connections.twitter" }], [] ] },
          { $cond: [{ $ifNull: ["$connections.spotify", false] },
            [{ type: "spotify", extra: "$connections.spotify" }], [] ] },
          { $cond: [{ $ifNull: ["$connections.twitch", false] },
            [{ type: "twitch", extra: "$connections.twitch" }], [] ] }
        ]
      }
    }
  },
  { $unwind: "$conns" },
  {
    $replaceRoot: {
      newRoot: {
        userId: "$userId",
        type: "$conns.type",
        externalId: { $ifNull: [{ $ifNull: ["$conns.id", "$conns.external_id"] }, ""] },
        name: "$conns.name",
        verified: "$conns.verified",
        visibility: "$conns.visibility",
        show_activity: "$conns.show_activity",
        friend_sync: "$conns.friend_sync",
        two_way_link: "$conns.two_way_link",
        metadata_visibility: "$conns.metadata_visibility",
        extra: "$conns"
      }
    }
  },
  {
    $merge: {
      into: "user_connections",
      on: ["userId", "type"],
      whenMatched: "replace",
      whenNotMatched: "insert"
    }
  }
]);

print('migration script finished');
