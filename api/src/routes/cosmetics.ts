/**
 * /api/cosmetics/* — cosmetic items (backgrounds, medals, stickers, etc.)
 * Thin Elysia controller — delegates to services/cosmetics for business logic.
 */

import Elysia from "elysia";
import { db } from "@plugins/db";
import { cleanup, searchCosmetics, findCosmeticById, countCosmetics } from "@services/cosmetics";
import type { CosmeticDoc } from "@definitions/CosmeticItems";

export const cosmeticsRoutes = new Elysia({ prefix: "/cosmetics", tags: ["cosmetics"] })

  // GET /cosmetics/all
  .get("/all", async () => {
    const result: CosmeticDoc[] = await db.cosmetics.find({});
    return result.map(cleanup);
  })

  // GET /cosmetics/search
  .get("/search", ({ query }) =>
    searchCosmetics(query as Record<string, string | undefined>))

  // TODO: PATCH /cosmetics/backgrounds/custom — requires skia-canvas worker
  .patch("/backgrounds/custom", () => ({ _stub: true, message: "Custom background upload not yet ported (requires skia-canvas worker)" }))
  // TODO: POST /cosmetics/backgrounds/custom — requires skia-canvas worker
  .post("/backgrounds/custom",  () => ({ _stub: true, message: "Custom background upload not yet ported (requires skia-canvas worker)" }))

  // GET /cosmetics/backgrounds/:id
  .get("/backgrounds/:id", async ({ params }) => {
    const result = await findCosmeticById("background", params.id);
    return cleanup(result);
  })

  // GET /cosmetics/medals/:id
  .get("/medals/:id", async ({ params }) => {
    const result = await findCosmeticById("medal", params.id);
    return cleanup(result);
  })

  // GET /cosmetics/count/:type
  .get("/count/:type", ({ params, query }) =>
    countCosmetics(params.type, query))

  // GET /cosmetics/:other/:id
  .get("/:other/:id", async ({ params }) => {
    const result = await findCosmeticById(params.other.slice(0, -1), params.id);
    return cleanup(result);
  });

