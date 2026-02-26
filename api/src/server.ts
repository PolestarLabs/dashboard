/**
 * pollux-core-api — main entry point
 *
 * Runs: bun run src/index.ts
 * Port: API_PORT env var (default 7056)
 *
 * /api/* traffic is routed here by nginx, bypassing the Express dashboard.
 * Express continues to serve page renders on port 6055.
 */


import { version } from "../package.json";

import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { serverTiming } from "@elysiajs/server-timing";

import { dbPlugin } from "@plugins/db";
import { redisPlugin } from "@plugins/redis";
import { authPlugin } from "@plugins/auth";

import { usersRoutes } from "@routes/controllers/users";
import { serversRoutes } from "@routes/controllers/servers";
import { internalRoutes } from "@routes/controllers/internal";
import { cosmeticsRoutes } from "@routes/controllers/cosmetics";
import { leaderboardsRoutes } from "@routes/controllers/leaderboards";
import { relationshipsRoutes } from "@routes/controllers/relationships";
import { primeRoutes } from "@routes/controllers/prime";
import { utilsRoutes } from "@routes/controllers/utils";
import { gamesRoutes } from "@routes/controllers/games";
import { collectionsRoutes } from "@routes/controllers/collections";
import { telemetryRoutes } from "@routes/controllers/telemetry";
import { fanartRoutes } from "@routes/controllers/fanart";

import { shipRoutes } from "@routes/controllers/ship";

const PORT = parseInt(process.env.API_PORT ?? "7056", 10);
const IS_DEV = process.env.NODE_ENV !== "production";

const app = new Elysia({ prefix: "/api" })
    // ── Cross-cutting concerns ───────────────────────────────────────────────
    .use(serverTiming())
    .use(
        cors({
            origin: IS_DEV
                ? ["https://staging.pollux.gg", `http://localhost:${PORT}`]
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
                ],
            },
        })
    )

    // ── Infrastructure plugins (db, redis, auth attached to app context) ─────
    .use(dbPlugin)
    .use(redisPlugin)
    .use(authPlugin)

    // ── Health ────────────────────────────────────────────────────────────────
    .get("/ping", () => ({ ok: true, pid: process.pid, ts: Date.now() }))
    .get("/pid", () => {
        console.log(`[PID] ${process.pid} received /pid request`);
        String(process.pid)
    })

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
    .use(shipRoutes)

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

app.listen({ port: PORT, hostname: IS_DEV ? "0.0.0.0" : "127.0.0.1" }, ({ hostname, port }) => {

});

export type App = typeof app;
export default app;
