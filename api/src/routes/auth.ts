/**
 * Dashboard auth routes — Discord OAuth2 + session cookie.
 *
 * Environment:
 *   DISCORD_CLIENT_ID     — OAuth2 application client ID (staging/prod can differ)
 *   DISCORD_CLIENT_SECRET — OAuth2 application client secret
 *   API_PUBLIC_URL        — Base URL of this API (e.g. https://api-staging.pollux.gg) for callback
 *
 * Flow:
 *   GET /auth/discord?redirect_uri=<SPA origin>  → 302 to Discord
 *   GET /auth/callback?code=...&state=...       → exchange code, set session cookie, 302 to state
 *   GET /auth/me                                → { id, username, avatarUrl } or 401
 *   POST /auth/logout                           → clear session, 204
 */

import Elysia, { redirect } from "elysia";
import { redis } from "@plugins/db";
import { getDiscordUser } from "utils/discord";

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID ?? "";
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET ?? "";
const API_PUBLIC_URL = (process.env.API_PUBLIC_URL ?? "").replace(/\/$/, "");
const AUTH_DEV_SECRET = process.env.AUTH_DEV_SECRET ?? "";
const IS_PROD = process.env.NODE_ENV === "production";
const COOKIE_NAME = "plx_session";
const SESSION_TTL = 7 * 24 * 3600; // 7 days
const SESSION_PREFIX = "auth:session:";

function buildSessionCookie(sessionId: string, requestUrl: string): string {
  const isSecure = requestUrl.startsWith("https");
  // Use SameSite=Lax so the cookie is accepted in modern browsers even on HTTP localhost,
  // and still sent on top-level navigations (OAuth redirects) in production.
  const sameSite = "Lax";
  const secureFlag = isSecure ? "; Secure" : "";
  return `${COOKIE_NAME}=${sessionId}; Path=/; Max-Age=${SESSION_TTL}; HttpOnly; SameSite=${sameSite}${secureFlag}`;
}

function randomId(): string {
  const buf = new Uint8Array(24);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(buf);
  }
  return Array.from(buf, (b) => b.toString(16).padStart(2, "0")).join("");
}

function parseCookie(header: string | null): string | null {
  if (!header) return null;
  const match = header.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
  const value = match?.[1];
  return value !== undefined ? decodeURIComponent(value) : null;
}

export const authRoutes = new Elysia({ prefix: "/auth", tags: ["auth"] })
  // GET /auth/dev-session — dev only: create session for a Discord user ID without OAuth (Discord requires HTTPS redirects).
  // Query: secret=AUTH_DEV_SECRET, uid=DISCORD_USER_ID, redirect_uri=SPA_URL. Only when NODE_ENV != production and AUTH_DEV_SECRET is set.
  .get("/dev-session", async ({ query, set, request }) => {
    if (IS_PROD || !AUTH_DEV_SECRET) {
      set.status = 404;
      return { error: "Not found" };
    }
    const secret = query.secret as string | undefined;
    const uid = query.uid as string | undefined;
    const redirectUri = (query.redirect_uri as string) ?? "http://localhost:5173";
    if (secret !== AUTH_DEV_SECRET || !uid) {
      set.status = 400;
      return { error: "Missing or invalid secret / uid" };
    }
    const sessionId = randomId();
    await redis.set(
      `${SESSION_PREFIX}${sessionId}`,
      { userId: uid, createdAt: Date.now() },
      SESSION_TTL
    );
    const cookieValue = buildSessionCookie(sessionId, request.url);
    set.headers = { "Set-Cookie": cookieValue, Location: redirectUri };
    set.status = 302;
    return redirect(redirectUri);
  })

  // GET /auth/discord?redirect_uri=https://dashboard.pollux.gg
  .get("/discord", ({ query, set }) => {
    const redirectUri = (query.redirect_uri as string) ?? "";
    const callbackUrl = `${API_PUBLIC_URL}/auth/callback`;
    const state = encodeURIComponent(redirectUri || "/");

    if (!DISCORD_CLIENT_ID || !API_PUBLIC_URL) {
      set.status = 503;
      return { error: "Auth not configured (DISCORD_CLIENT_ID / API_PUBLIC_URL)" };
    }

    const url = new URL("https://discord.com/api/oauth2/authorize");
    url.searchParams.set("client_id", DISCORD_CLIENT_ID);
    url.searchParams.set("redirect_uri", callbackUrl);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "identify");
    url.searchParams.set("state", state);
    return redirect(url.toString());
  })

  // GET /auth/callback?code=...&state=...
  .get("/callback", async ({ query, set, request }) => {
    const code = query.code as string | undefined;
    const state = query.state as string | undefined;
    const callbackUrl = `${API_PUBLIC_URL}/auth/callback`;

    if (!code || !DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET) {
      set.status = 400;
      return redirect(decodeURIComponent(state ?? "/"));
    }

    const body = new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      client_secret: DISCORD_CLIENT_SECRET,
      grant_type: "authorization_code",
      code,
      redirect_uri: callbackUrl,
    });

    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    if (!tokenRes.ok) {
      set.status = 401;
      return redirect(decodeURIComponent(state ?? "/"));
    }

    const tokenData = (await tokenRes.json()) as { access_token?: string };
    const accessToken = tokenData.access_token;
    if (!accessToken) {
      set.status = 401;
      return redirect(decodeURIComponent(state ?? "/"));
    }

    const userRes = await fetch("https://discord.com/api/v10/users/@me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!userRes.ok) {
      set.status = 401;
      return redirect(decodeURIComponent(state ?? "/"));
    }

    const discordUser = (await userRes.json()) as { id: string; username: string; avatar: string | null };
    const sessionId = randomId();
    await redis.set(
      `${SESSION_PREFIX}${sessionId}`,
      { userId: discordUser.id, createdAt: Date.now() },
      SESSION_TTL
    );

    const redirectTo = state ? decodeURIComponent(state) : "/";
    const cookieValue = buildSessionCookie(sessionId, request.url);
    set.headers = { "Set-Cookie": cookieValue, Location: redirectTo };
    set.status = 302;
    return redirect(redirectTo);
  })

  // GET /auth/me — current session user for SPA
  .get("/me", async ({ request, set }) => {
    const cookieHeader = request.headers.get("cookie");
    const sessionId = parseCookie(cookieHeader);
    if (!sessionId) {
      set.status = 401;
      return { message: "Not authenticated" };
    }

    const session = await redis.get<{ userId: string; createdAt: number }>(`${SESSION_PREFIX}${sessionId}`);
    if (!session?.userId) {
      set.status = 401;
      return { message: "Session expired or invalid" };
    }

    const discordUser = await getDiscordUser(session.userId);
    return {
      id: discordUser.id,
      username: discordUser.username,
      discriminator: discordUser.discriminator ?? null,
      avatarUrl: discordUser.avatarURL ?? null,
    };
  })

  // POST /auth/logout
  .post("/logout", async ({ request, set }) => {
    const cookieHeader = request.headers.get("cookie");
    const sessionId = parseCookie(cookieHeader);
    if (sessionId) await redis.del(`${SESSION_PREFIX}${sessionId}`);
    set.status = 204;
    set.headers = {
      "Set-Cookie": `${COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`,
    };
    return;
  });
