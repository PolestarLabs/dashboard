import { Elysia, t, status } from "elysia";
import type Context from "elysia";

export default new Elysia()
    // alias lookup
    .get("/crafting/:item", async (context: Context): void => {
        const { params, db: DB } = context;
        const { item } = params;

        const resultItem = await DB.items.findOne(
            { id: item },
            { _id: 0, __v: 0, emoji: 0 }
        ).lean();

        if (!resultItem) {
            return status(404, { error: `Item "${item}" does not exist.` });
        }

        return resultItem;

    }, {
        params: t.Object({ item: t.String() }),
        query: t.Object({ skip: t.Optional(t.String()), lim: t.Optional(t.String()) }),
    })