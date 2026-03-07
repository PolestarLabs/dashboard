/*
 * Migration helper: copy data from the existing `userdb` documents into
 * the new collections defined in USER_SCHEMA_REFACTOR.md.  This script
 * does **not** remove or mutate the source documents; it merely clones
 * the fields and structures into the target collections so you can roll
 * forward with the phased rollout described in the proposal.
 *
 * Usage:
 *   node migrate_user_schema.js
 *
 * The script assumes you have a `gobal_secrets.js` module at the repo
 * root exporting `dbURL` (production) and `dbURL_beta` (alpha), as
 * seen in the workspace.
 *
 * TODO after migration: encrypt the OAuth tokens in `user_oauth` and
 *       drop the plaintext versions from the original documents.
 */

const { MongoClient, ObjectId } = require('mongodb');
const secrets = require('../../../../gobal_secrets.js');

async function main() {
  console.log('🚀 [migration] starting migration');
  const client = new MongoClient(secrets.dbURL, { useUnifiedTopology: true });
  await client.connect();
  console.log('✅ [migration] connected to', secrets.dbURL);

  const db = client.db();
  const source = db.collection('userdb');

  // ensure indexes on target collections
  console.log('[migration] creating indexes');
  await Promise.all([
    db.collection('users').createIndex({ id: 1 }, { unique: true }),
    db.collection('users').createIndex({ personalhandle: 1 }, { unique: true, sparse: true }),
    db.collection('user_inventory').createIndex({ userId: 1 }, { unique: true }),
    db.collection('user_oauth').createIndex({ userId: 1 }, { unique: true }),
    db.collection('user_guilds').createIndex({ userId: 1 }),
    db.collection('user_guilds').createIndex({ guildId: 1 }),
    db.collection('user_quests').createIndex({ userId: 1, questId: 1 }, { unique: true }),
    db.collection('user_analytics').createIndex({ userId: 1 }, { unique: true }),
    db.collection('user_connections').createIndex({ userId: 1, type: 1 }, { unique: true })
  ]);
  console.log('[migration] indexes created');

  const cursor = source.find({}, { batchSize: 500 });
  let count = 0;

  while (await cursor.hasNext()) {
    const doc = await cursor.next();
    count++;
    const uid = doc.id;
    console.log(`[migration] processing user #${count} (${uid}) - ${doc.meta?.tag || doc.name || ''}`);

    // 1. users/core document
    const core = {
      id: uid,
      name: doc.name || doc.meta?.tag || '',
      tag: doc.tag || doc.meta?.tag || '',
      avatar: doc.meta?.avatar || doc.avatar || null,
      // leave field undefined when no handle to avoid unique-null clashes
      ...(doc.personalhandle ? { personalhandle: doc.personalhandle } : {}),
      currency: {
        RBN: doc.modules?.RBN || doc.RBN || 0,
        SPH: doc.modules?.SPH || doc.SPH || 0,
        JDE: doc.modules?.JDE || doc.JDE || 0,
        PSM: doc.modules?.PSM || 0,
        EVT: doc.modules?.EVT || doc.eventTokens || doc.eventGoodie || 0,
      },
      profile: {
        featuredMarriage: doc.featuredMarriage || null,
        bgID: doc.profile?.bgID || doc.modules?.bg || null,
        flairTop: doc.profile?.flairTop || null,
        sticker: doc.profile?.sticker || null,
        favcolor: doc.profile?.favcolor || '#000000',
        persotext: doc.profile?.persotext || '',
        tagline: doc.profile?.tagline || '',
        medals: doc.profile?.medals || [],
        skins: doc.modules?.skins || {}
      },
      progression: {
        ...doc.progression,
        level: doc.modules?.level || doc.level || 0,
        exp: doc.modules?.exp || doc.exp || 0,
      },
      meta: {
        createdAt: doc._id.getTimestamp(),
        lastLogin: doc.lastLogin || new Date(0),
        migrated: true,
        lastUpdated: doc.lastUpdated || new Date(doc._id.getTimestamp()),
      },
      prime: doc.prime || null,
      blacklisted: doc.blacklisted || null,
      switches: doc.switches || {},
      counters: doc.counters || {},
      eventData: doc.eventData || null,
    };

    try {
      await db.collection('users').updateOne({ id: uid }, { $set: core }, { upsert: true });
    } catch (e) {
      console.error(`[migration][${uid}] failed to upsert core`, e);
    }

    // 2. user_inventory
    const cosmetics = {
      userId: uid,
      inventory: doc.modules?.inventory || [],
      bgInventory: doc.modules?.bgInventory || [],
      skinInventory: doc.modules?.skinInventory || [],
      flairInventory: doc.modules?.flairsInventory || [],
      medalInventory: (doc.modules?.medalInventory || []).filter(x => x != null),
      stickerInventory: (doc.modules?.stickerInventory || []).filter(x => x != null),
      stickerShowcase: doc.modules?.stickerCollection || [],
      fishes: doc.modules?.fishes || [],
      fishShowcase: doc.modules?.fishCollection || [],
      achievements: doc.modules?.achievements || [],
    };
    try {
      await db.collection('user_inventory').updateOne({ userId: uid }, { $set: cosmetics }, { upsert: true });
    } catch (e) {
      console.error(`[migration][${uid}] failed to upsert cosmetics`, e);
    }

    // 3. user_oauth (note: tokens are copied plaintext; encrypt later)
    const oauth = {
      userId: uid,
      discordIdentityCache: doc.discordData?.id ? {
        id: doc.discordData.id,
        username: doc.discordData.username,
        avatar: doc.discordData.avatar,
        discriminator: doc.discordData.discriminator,
        global_name: doc.discordData.global_name,
        banner: doc.discordData.banner,
        flags: doc.discordData.flags,
        premium_type: doc.discordData.premium_type
      } : undefined,
      discord: doc.discordData ? {
        accessToken: doc.discordData.accessToken,
        refreshToken: doc.discordData.refreshToken,
        expiresAt: doc.discordData.expiresAt,
        scope: doc.discordData.scope,
        email: doc.discordData.email,
        locale: doc.discordData.locale,
        verified: doc.discordData.verified,
        mfa_enabled: doc.discordData.mfa_enabled,
        premium_type: doc.discordData.premium_type
      } : undefined,
      patreon: doc.connections?.patreon ? {
        accessToken: doc.connections.patreon.access_token,
        refreshToken: doc.connections.patreon.refresh_token,
        expiresAt: doc.connections.patreon.expires_in ? new Date(Date.now() + doc.connections.patreon.expires_in * 1000) : undefined,
        scope: doc.connections.patreon.scope,
        identity: doc.connections.patreon.identity
      } : undefined,
      geo: doc.personal ? { ...doc.personal } : undefined,
      fetchedAt: new Date()
    };
    try {
      await db.collection('user_oauth').updateOne({ userId: uid }, { $set: oauth }, { upsert: true });
    } catch (e) {
      console.error(`[migration][${uid}] failed to upsert oauth`, e);
    }

    // 4. user_guilds (if present)
    if (Array.isArray(doc.discordData?.guilds)) {
      const guilds = doc.discordData.guilds;
      const now = new Date();
      const bulk = db.collection('user_guilds').initializeUnorderedBulkOp();
      for (const g of guilds) {
        bulk.find({ userId: uid, guildId: g.id }).upsert().updateOne({
          $set: {
            userId: uid,
            guildId: g.id,
            name: g.name,
            icon: g.icon || null,
            banner: g.banner || null,
            owner: g.owner || false,
            permissions: g.permissions || 0,
            permissions_new: g.permissions_new || '',
            features: g.features || [],
            cachedAt: now
          }
        });
      }
      if (bulk.length > 0) {
        try {
          await bulk.execute();
        } catch (e) {
          console.error(`[migration][${uid}] failed to write guilds`, e);
        }
      }
    }

    // 5. user_quests
    if (Array.isArray(doc.quests)) {
      const bulk = db.collection('user_quests').initializeUnorderedBulkOp();
      for (const q of doc.quests) {
        bulk.find({ userId: uid, questId: q.id }).upsert().updateOne({ $set: {
          userId: uid,
          questId: q.id,
          target: q.target,
          tracker: q.tracker,
          progress: q.progress,
          completed: q.completed,
          completedAt: q.completedAt
        }});
      }
      if (bulk.length > 0) {
        try {
          await bulk.execute();
        } catch (e) {
          console.error(`[migration][${uid}] failed to write quests`, e);
        }
      }
    }

    // 6. user_analytics
    const analytics = {
      userId: uid,
      legacy: {
        globalLV: doc.progression?.globalLV || 0,
        globalXP: doc.progression?.globalXP || 0
      },
      dashThemeClicks: doc.counters?.dashThemeClicks || {},
      
      statistics: doc.modules?.statistics || {}
    };
    try {
      await db.collection('user_analytics').updateOne({ userId: uid }, { $set: analytics }, { upsert: true });
    } catch (e) {
      console.error(`[migration][${uid}] failed to upsert analytics`, e);
    }

    // 7. user_connections
    const connArray = [];
    if (doc.discordData?.connections) {
      for (const c of doc.discordData.connections) {
        connArray.push({
          userId: uid,
          type: c.type,
          externalId: c.id,
          name: c.name,
          verified: c.verified,
          visibility: c.visibility,
          show_activity: c.show_activity,
          friend_sync: c.friend_sync,
          two_way_link: c.two_way_link,
          metadata_visibility: c.metadata_visibility,
          extra: c
        });
      }
    }
    if (doc.connections) {
      ['lastfm','twitter','spotify','twitch'].forEach(k => {
        if (doc.connections[k]) {
          connArray.push({
            userId: uid,
            type: k,
            externalId: doc.connections[k].id || doc.connections[k].username || '',
            name: doc.connections[k].name || '',
            verified: !!doc.connections[k].verified,
            visibility: doc.connections[k].visibility || 0,
            show_activity: doc.connections[k].show_activity || false,
            friend_sync: doc.connections[k].friend_sync || false,
            two_way_link: doc.connections[k].two_way_link || false,
            metadata_visibility: doc.connections[k].metadata_visibility || 0,
            extra: doc.connections[k]
          });
        }
      });
    }
    if (connArray.length) {
      const bulk = db.collection('user_connections').initializeUnorderedBulkOp();
      for (const c of connArray) {
        bulk.find({ userId: uid, type: c.type }).upsert().updateOne({ $set: c });
      }
      try {
        await bulk.execute();
      } catch (e) {
        console.error(`[migration][${uid}] failed to write connections`, e);
      }
    }

    if (count % 500 === 0) console.log(`[migration] ${count} users processed`);
  }

  console.log(`🎉 [migration] done: ${count} users migrated`);
  await client.close();
}

main().catch(err => {
  console.error('migration failed', err);
  process.exit(1);
});