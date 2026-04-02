/**
 * pollux-core-api — main server
 *
 * Runs: bun run src/index.ts
 * Port: API_PORT env var (default 7056)
 */

import { version } from "../package.json";

import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { serverTiming } from "@elysiajs/server-timing";

import { connectDB, connectRedis } from "@plugins/db";
import { authPlugin } from "@plugins/auth";

import { usersRoutes } from "@routes/users";
import { serversRoutes } from "@routes/servers";
import { internalRoutes } from "@routes/internal";
import { cosmeticsRoutes } from "@routes/cosmetics";
import { leaderboardsRoutes } from "@routes/leaderboards";
import { relationshipsRoutes } from "@routes/relationships";
import { primeRoutes } from "@routes/prime";
import { utilsRoutes } from "@routes/utils";
import { gamesRoutes } from "@routes/games";
import { collectionsRoutes } from "@routes/collections";
import { telemetryRoutes } from "@routes/telemetry";
import { fanartRoutes } from "@routes/fanart";

import { shipRoutes } from "@routes/ship";
import { marketplaceRoutes } from "@routes/marketplace";
import { questsRoutes } from "@routes/quests";
import { progressionRoutes } from "@routes/progression";
import { systemRoutes } from "@routes/system";
import { economyRoutes } from "@routes/economy";
import { adventureRoutes } from "@routes/games/adventure";

const PORT = parseInt(process.env.API_PORT ?? "7056", 10);
const IS_DEV = process.env.NODE_ENV !== "production";

// ── Initialize infrastructure ────────────────────────────────────────────────

connectRedis();

// ── App ──────────────────────────────────────────────────────────────────────

const app = new Elysia()
    .use(serverTiming())
    .headers({"X-API-Version": "Pollux API v2 :: Elysia"})
    .use(
        cors({
            origin: IS_DEV
                ? ["https://staging.pollux.gg","https://api-staging.pollux.gg", `http://localhost:${PORT}`]
                : ["https://pollux.gg"],
            credentials: true,
        })
    )
    .use(
        swagger({
            path: "/docs",
            documentation: {
                info: { title: "Pollux Core API", version },
                tags: [
                    { name: "users", description: "User data and profiles" },
                    { name: "servers", description: "Server (guild) data" },
                    { name: "leaderboards", description: "XP and rank tables" },
                    { name: "relationships", description: "User relationships" },
                    { name: "prime", description: "Prime subscription system" },
                    { name: "cosmetics", description: "Cosmetic items" },
                    { name: "games", description: "Minigame state" },
                    { name: "collections", description: "Crafting / items" },
                    { name: "fanart", description: "Fanart gallery" },
                    { name: "telemetry", description: "Internal pings and metrics" },
                    { name: "internal", description: "Internal service endpoints" },
                    { name: "generators", description: "Image generator endpoints" },
                    { name: "utils", description: "Utility endpoints" },
                    { name: "marketplace", description: "Marketplace listings" },
                    { name: "quests", description: "Quest definitions and user quest progression" },
                    { name: "progression", description: "User XP and level progression" },
                    { name: "system", description: "Blacklist management and audit logging" },
                    { name: "economy", description: "Currency transfers, balances, and transactions" },
                    { name: "adventure", description: "Adventure locations, encounters, and journals" },
                ],
            },
        })
    )

    // ── Auth (only plugin that needs request context) ─────────────────────────
    .use(authPlugin)

    // ── Health ────────────────────────────────────────────────────────────────
    .get("/ping", () => ({ ok: true, pid: process.pid, ts: Date.now() }))
    .get("/pid", () => String(process.pid))

    // ── Domain routes ─────────────────────────────────────────────────────────
    .use(usersRoutes)
    .use(serversRoutes)
    .use(internalRoutes)
    .use(cosmeticsRoutes)
    .use(leaderboardsRoutes)
    .use(relationshipsRoutes)
    .use(primeRoutes)
    .use(utilsRoutes)
    .use(gamesRoutes)
    .use(collectionsRoutes)
    .use(telemetryRoutes)
    .use(fanartRoutes)
    .use(shipRoutes)
    .use(marketplaceRoutes)
    .use(questsRoutes)
    .use(progressionRoutes)
    .use(systemRoutes)
    .use(economyRoutes)
    .use(adventureRoutes)

    // ── Global error handler ──────────────────────────────────────────────────
    .onError(({ code, error, set }) => {
        const status =
            code === "NOT_FOUND" ? 404 :
                code === "VALIDATION" ? 422 :
                    code === "INVALID_COOKIE_SIGNATURE" ? 401 :
                        500;
        set.status = status;
        console.error(`[API Error] ${code}`, error);
        return {
            error: code,
            message: IS_DEV ? String(error) : "An error occurred",
        };
    });

// ── Start ────────────────────────────────────────────────────────────────────

connectDB().then(() => {
  app.listen({ port: PORT, hostname: IS_DEV ? "0.0.0.0" : "127.0.0.1" });
});

export type App = typeof app;
export default app;
