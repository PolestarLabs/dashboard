/**
 * Discord REST helpers — cache-first.
 *
 * Strategy (per blueprint §3.2):
 *   1. Check Redis (TTL 6 h, warmed by Eris bot on USER_UPDATE / GUILD_MEMBER_UPDATE)
 *   2. On miss: fetch discord.com/api/v10 with the bot token, store result in Redis
 */

import { redis } from "@plugins/db";

const DISCORD_API = "https://discord.com/api/v10";
const BOT_TOKEN   = process.env.BOT_TOKEN ?? "";
const USER_TTL    = 6 * 3600; // 6 hours

export interface DiscordUser {
  id:            string;
  username:      string;
  discriminator?: string;
  global_name?:  string | null;
  avatar:        string | null;
  avatarURL:     string | null;
  bot?:          boolean;
  error?:        string;
}

function buildAvatarURL(u: { id: string; avatar: string | null }): string | null {
  if (!u.avatar) return null;
  const ext = u.avatar.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.${ext}?size=256`;
}

function normalise(raw: Record<string, unknown>): DiscordUser {
  const u = raw as unknown as DiscordUser;
  u.avatarURL = buildAvatarURL(u);
  return u;
}

/**
 * Fetch a user — Redis first, Discord REST on miss.
 */
export async function getDiscordUser(id: string): Promise<DiscordUser> {
  const cacheKey = `discord:user:${id}`;

  const cached = await redis.get<DiscordUser>(cacheKey);
  if (cached) return cached;

  try {
    const resp = await fetch(`${DISCORD_API}/users/${id}`, {
      headers: { Authorization: `Bot ${BOT_TOKEN}` },
    });

    if (!resp.ok) {
      return { id, username: "Unknown", avatar: null, avatarURL: null, error: `HTTP ${resp.status}` };
    }

    const raw = (await resp.json()) as Record<string, unknown>;
    const user = normalise(raw);

    await redis.set(cacheKey, user, USER_TTL);
    return user;
  } catch (err) {
    return { id, username: "Unknown", avatar: null, avatarURL: null, error: String(err) };
  }
}

/**
 * Batch-fetch many users, leveraging parallelised Redis + Discord fetches.
 */
export async function getManyDiscordUsers(ids: string[]): Promise<DiscordUser[]> {
  return Promise.all(ids.map((id) => getDiscordUser(id)));
}
