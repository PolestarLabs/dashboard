/**
 * controllers/collections/crafting.ts — /crafting/* route handlers.
 */

import Elysia, { t, status } from "elysia";
import { authPlugin } from "@plugins/auth";
import { db } from "@plugins/db";
import { CraftingService } from "@services/crafting";
import RARITY_VALUES from "@definitions/constants/Rarity";

const PotItemSchema = t.Object({
  id:     t.String(),
  count:  t.Number(),
  rarity: t.Optional(t.String()),
});

const MixBodySchema = t.Object({
  pot: t.Array(PotItemSchema),
});

const CreateBodySchema = t.Object({
  item: t.String(),
  pot:  t.Optional(t.Array(t.Object({ id: t.String(), count: t.Number() }))),
});

export const craftingRoutes = new Elysia()
  .use(authPlugin)

  .get("/crafting/:item", async ({ params }) => {
    const result = await db.items
      .findOne({ id: params.item }, { _id: 0, __v: 0, emoji: 0 });
    if (!result)
      return status(404, { error: `Item "${params.item}" does not exist.` });
    return result;
  })

  .post("/crafting/mix", async ({ apiUser, body }) => {
    return CraftingService.mix(body, apiUser?.id);
  }, { body: MixBodySchema })

  .post("/crafting/create", async ({ body, requireAuth }) => {
    const user   = requireAuth();
    const result = await CraftingService.craft(body, user.id);
    return status(result.code, result.body);
  }, { body: CreateBodySchema })

  .post("/crafting/craft", async ({ body, requireAuth }) => {
    const user   = requireAuth();
    const result = await CraftingService.craft(body, user.id);
    return status(result.code, result.body);
  }, { body: CreateBodySchema });
