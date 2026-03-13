# Dashboard auth (Discord OAuth)

The API exposes session-based auth for the Vue dashboard SPA.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/auth/discord` | Redirects to Discord OAuth2. Query: `redirect_uri` (SPA origin to return to). |
| GET | `/auth/callback` | Discord callback; sets session cookie, redirects to `state` (SPA). |
| GET | `/auth/me` | Returns current user `{ id, username, discriminator, avatarUrl }` or 401. |
| POST | `/auth/logout` | Clears session cookie and session in Redis; 204. |
| GET | `/auth/dev-session` | **Dev only:** create session for a Discord user ID without OAuth. Query: `secret`, `uid`, `redirect_uri`. See below. |

## Environment

Set these in the API environment (e.g. `.env` or deployment config):

- **`DISCORD_CLIENT_ID`** — Discord OAuth2 application client ID (create in [Discord Developer Portal](https://discord.com/developers/applications) → OAuth2).
- **`DISCORD_CLIENT_SECRET`** — OAuth2 client secret.
- **`API_PUBLIC_URL`** — Public base URL of this API (e.g. `https://api-staging.pollux.gg` or `https://api.pollux.gg`). Must match the redirect URI registered in the Discord app.

Discord **only allows HTTPS** redirect URIs (no `http://`). In the Discord app’s OAuth2 → Redirects, add **exactly** `{API_PUBLIC_URL}/auth/callback`:

- Staging: `https://api-staging.pollux.gg/auth/callback`
- Production: `https://api.pollux.gg/auth/callback`

**Local development:** Use an HTTPS tunnel (e.g. [ngrok](https://ngrok.com), [cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/run-tunnel)) so your API is reachable at `https://something.trycloudflare.com` (or similar). Set `API_PUBLIC_URL` to that HTTPS URL, add `https://.../auth/callback` in Discord redirects, and point the SPA’s `VITE_API_BASE` at the tunnel URL so the login flow runs over HTTPS. Alternatively use the dev-only session route below to test without Discord.

## Dev-only session (no Discord, localhost)

Because Discord only allows HTTPS redirects, you can create a session without OAuth for local testing:

1. In `api/.env` set `AUTH_DEV_SECRET` to any secret (and ensure `NODE_ENV` is not `production`).
2. Open in the browser (or point the SPA “Login” here in dev):
   `GET {API_BASE}/auth/dev-session?secret=YOUR_AUTH_DEV_SECRET&uid=DISCORD_USER_ID&redirect_uri=http://localhost:5173`
   Use a real Discord user ID for `uid`. The API creates a session, sets the cookie, and redirects to `redirect_uri`; the SPA then sees you as logged in. This route returns 404 in production or when `AUTH_DEV_SECRET` is unset.

## SPA usage

1. User clicks “Login with Discord” → SPA redirects to `GET {API_BASE}/auth/discord?redirect_uri={SPA_ORIGIN}`.
2. User authorizes on Discord → Discord redirects to API `/auth/callback`; API sets `plx_session` cookie and redirects to SPA.
3. SPA calls `GET {API_BASE}/auth/me` with `credentials: 'include'`; API returns user or 401.
4. Logout: SPA calls `POST {API_BASE}/auth/logout` with `credentials: 'include'`.
