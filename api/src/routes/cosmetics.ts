/**
 * /api/cosmetics/* — cosmetic items (backgrounds, medals, stickers, etc.)
 * Thin Elysia controller — delegates to services/cosmetics for business logic.
 */

import Elysia from "elysia";
import { dbPlugin } from "@plugins/db";
import { redisPlugin } from "@plugins/redis";

import {
  CosmeticSearchQuery, CosmeticIdParams,
  CosmeticCountParams, CosmeticCountQuery,
  CosmeticGenericParams,
} from "@routes/schemas";

import {
  cleanup, searchCosmetics, findCosmeticById, countCosmetics,
} from "@services/cosmetics";

import type { CosmeticDoc } from "@routes/types";

export const cosmeticsRoutes = new Elysia({ prefix: "/cosmetics", tags: ["cosmetics"] })
  .use(dbPlugin)
  .use(redisPlugin)

  .get("/all", async ({ db }) => {
    const result: CosmeticDoc[] = await (db as any).cosmetics.find({});
    return result.map(cleanup);
  })

  .get("/search", ({ query, db }) =>
    searchCosmetics(query as Record<string, string | undefined>, db),
  { query: CosmeticSearchQuery })

  .patch("/backgrounds/custom", () => ({ _stub: true, message: "Custom background upload not yet ported (requires skia-canvas worker)" }))
  .post("/backgrounds/custom",  () => ({ _stub: true, message: "Custom background upload not yet ported (requires skia-canvas worker)" }))

  .get("/backgrounds/:id", async ({ params, db }) => {
    const result = await findCosmeticById("background", params.id, db);
    return cleanup(result);
  }, { params: CosmeticIdParams })

  .get("/medals/:id", async ({ params, db }) => {
    const result = await findCosmeticById("medal", params.id, db);
    return cleanup(result);
  }, { params: CosmeticIdParams })

  .get("/count/:type", ({ params, query, db }) =>
    countCosmetics(params.type, query, db),
  { params: CosmeticCountParams, query: CosmeticCountQuery })

  .get("/:other/:id", async ({ params, db }) => {
    const result = await findCosmeticById(params.other.slice(0, -1), params.id, db);
    return cleanup(result);
  }, { params: CosmeticGenericParams });

