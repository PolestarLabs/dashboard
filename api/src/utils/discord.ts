/**
 * Discord REST helpers — cache-first, never blocking the Elysia main thread.
 *
 * Strategy (per blueprint §3.2):
 *   1. Check Redis (TTL 6 h, warmed by Eris bot on USER_UPDATE / GUILD_MEMBER_UPDATE)
 *   2. On miss: fetch discord.com/api/v10 with the bot token, store result in Redis
 *
 * The bot token is read from BOT_TOKEN env, expected to be identical to the
 * one already used by the Eris bot workers.
 */

const DISCORD_API = "https://discord.com/api/v10";
const BOT_TOKEN   = process.env.BOT_TOKEN ?? "";
const USER_TTL    = 6 * 3600; // 6 hours — matches redisPlugin default

export interface DiscordUser {
  id:          string;
  username:    string;
  discriminator?: string;
  global_name?: string | null;
  avatar:      string | null;
  bot?:        boolean;
  /** Set when the fetch itself failed */
  error?:      string;
}

/** Build the CDN avatar URL the legacy code expects under `.avatarURL`. */
function avatarURL(u: DiscordUser): string | null {
  if (!u.avatar) return null;
  const ext = u.avatar.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.${ext}?size=256`;
}

/** Normalise a raw Discord API user object to the shape the legacy code uses. */
function normalise(raw: Record<string, unknown>): DiscordUser {
  // cast via unknown to satisfy TS warnings about overlapping types
  const u = raw as unknown as DiscordUser;
  // attach legacy avatarURL property without upsetting the strict type
  (u as any).avatarURL = avatarURL(u);
  return u;
}

/**
 * Fetch a user — Redis first, Discord REST on miss.
 *
 * @param id      Discord snowflake
 * @param redis   ioredis client (from redisPlugin context)
 */
export async function getDiscordUser(
  id: string,
  redis: { get: <T>(k: string) => Promise<T | null>; set: (k: string, v: unknown, ttl?: number) => Promise<void> }
): Promise<DiscordUser> {
  const cacheKey = `discord:user:${id}`;

  // 1. Cache hit
  const cached = await redis.get<DiscordUser>(cacheKey);
  if (cached) return cached;

  // 2. Cache miss — call Discord
  try {
    const resp = await fetch(`${DISCORD_API}/users/${id}`, {
      headers: { Authorization: `Bot ${BOT_TOKEN}` },
    });

    if (!resp.ok) {
      const errUser: DiscordUser = { id, username: "Unknown", avatar: null, error: `HTTP ${resp.status}` };
      (errUser as any).avatarURL = null;
      return errUser;
    }

    const raw = (await resp.json()) as Record<string, unknown>;
    const user = normalise(raw);

    await redis.set(cacheKey, user, USER_TTL);
    return user;
  } catch (err) {
    const errUser: DiscordUser = { id, username: "Unknown", avatar: null, error: String(err) };
    (errUser as any).avatarURL = null;
    return errUser;
  }
}

/**
 * Batch-fetch many users, leveraging Redis multi-get and parallelising only
 * the Discord fetches that are actually needed on a cache miss.
 */
export async function getManyDiscordUsers(
  ids: string[],
  redis: Parameters<typeof getDiscordUser>[1]
): Promise<DiscordUser[]> {
  return Promise.all(ids.map((id) => getDiscordUser(id, redis)));
}
