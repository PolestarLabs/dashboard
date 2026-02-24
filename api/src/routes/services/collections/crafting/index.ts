
import Elysia, { t, status } from "elysia";
import { authPlugin } from "@plugins/auth";
import { dbPlugin } from "@plugins/db";

import {
    ItemParamsSchema,
    MixBodySchema, MixResponseSchema,
    CreateBodySchema,
} from "./model";
import { CraftingService } from "./service";


export const craftingRoutes = new Elysia()
  .use(authPlugin)
  .use(dbPlugin)

    // GET /api/crafting/:item — item lookup by id
    .get("/crafting/:item", async ({ params, db }) => {

        const result = await db.items
            .findOne({ id: params.item }, { _id: 0, __v: 0, emoji: 0 })
            .lean();
        if (!result) return status(404, { error: `Item "${params.item}" does not exist.` });
        return result;
    }, {
        params: ItemParamsSchema,
        response: {
            404: t.Object({ error: t.String() }),
        },
    })

    // POST /api/crafting/mix — crafting discovery
    .post("/crafting/mix", async ({ apiUser, body, db }) => {
        return CraftingService.mix(body, apiUser?.id, db);
    }, {
        body: MixBodySchema,
        response: {
            200: MixResponseSchema,
            400: t.Object({ error: t.String() }),
        },
    })

    // POST /api/crafting/create — execute a craft
    .post("/crafting/create", async ({ body, requireAuth, db }) => {
        const user = requireAuth();
        const result = await CraftingService.craft(body, user.id, db);
        return status(result.code, result.body);
    }, {
        body: CreateBodySchema,
    })

    // POST /api/crafting/craft — alias for /crafting/create
    .post("/crafting/craft", async ({ body, requireAuth, db }) => {
        const user = requireAuth();
        const result = await CraftingService.craft(body, user.id, db);
        return status(result.code, result.body);
    }, {
        body: CreateBodySchema,
    });
