import Elysia, { t } from "elysia";
import { authPlugin } from "@plugins/auth";

export default new Elysia()
    .use(authPlugin)
    // POST /api/crafting/create  (alias: /craft) — execute a craft
    .post("/crafting/create", async ({ body, requireAuth, db, set } ) => {
        const apiUser = requireAuth();
        const DB = db;
        const { pot, item } = body;

        const itemToCraft = await DB.items.get({ id: item });
        if (!itemToCraft?.crafted) {
            set.status = 403;
            return { status: "ERROR", message: "This item can't be crafted" };
        }

        const [userData, cosmeticsDoc] = await Promise.all([
            DB.users.get(apiUser.id),
            DB.userInventory.getFull(apiUser.id),
        ]);
        if (!userData) {
            set.status = 401;
            return { status: "ERROR", message: "Not Logged in" };
        }

        const materials = pot ?? itemToCraft.materials;
        for (const itm of materials) {
            const has = cosmeticsDoc.inventory.find((i: any) => i.id === itm.id);
            if (!has || has.count < itm.count) {
                set.status = 403;
                return {
                    status: "ERROR",
                    message: `You don't have enough of [${itm.id}]`,
                };
            }
        }

        await Promise.all(materials.map((m: any) => cosmeticsDoc.removeItem(m.id, m.count)));
        await Promise.all([
            cosmeticsDoc.addItem(item, 1, true),
            DB.users.set(apiUser.id, {
                $inc: {
                    "progression.craftingExp": {
                        C: 1,
                        U: 2,
                        R: 5,
                        SR: 10,
                        UR: 25,
                        XR: 50,
                    }[itemToCraft.rarity as string] ?? 1,
                },
            }),
        ]);

        return { status: "OK", message: "Item has been crafted", inventory: cosmeticsDoc.inventory };
    }, {
        body: t.Object({
            item: t.String(),
            pot: t.Optional(t.Array(t.Object({ id: t.String(), count: t.Number() }))),
        }),
    })
