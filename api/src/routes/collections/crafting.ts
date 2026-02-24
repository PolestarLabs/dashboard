import { Elysia, t } from "elysia";
import { isExact, shuffle } from "./index";
import { RARITY_VALUES, RarityType as Rarity } from "@definitions/Rarity";
import { InventoryItem } from "@definitions/InventoryItem";
import type { ApiUser } from "@plugins/auth";
import { Schemas } from "@polestar/database_schema";


// helper used by multiple sort callbacks below
function rarityCompare(a: InventoryItem, b: InventoryItem): number {
  const ia = RARITY_VALUES.indexOf(a.rarity as Rarity);
  const ib = RARITY_VALUES.indexOf(b.rarity as Rarity);
  return ia - ib;
}



interface CraftingMaterialItem extends InventoryItem { count: number; }


interface MixBody { pot: CraftingMaterialItem[]; }
interface CraftBody { item: string; pot?: { id: string; count: number }[]; }

interface RequestParams {
    db: Schemas;
    apiUser: ApiUser;
    body: Record<string, string>;
    params: Record<string, string>;
    query: Record<string, string>;
}

interface CraftingMixResponse {
    discovery?: InventoryItem;
    possible?: number;
    isDiscovery?: boolean;
    canCraftNow?: boolean;
    typeCraft?: boolean;
    notQuite?: boolean;
    noMoreTable?: boolean;
    error?: string;
}


export const craftingRoutes = new Elysia()
    // alias lookup
    .get("/crafting/:item", async (context:RequestParams) => {
        const { params, db: DB } = context;

        const resultItem = await DB.items.findOne(
            { id: params.item },
            { _id: 0, __v: 0, emoji: 0 }
        ).lean();

        if (!resultItem) {
            return { error: "Item not found", status: 404 };
        }

        return resultItem;

    }, {
        params: t.Object({ item: t.String() }),
        query: t.Object({ skip: t.Optional(t.String()), lim: t.Optional(t.String()) }),
    })


    // POST /api/crafting/mix — crafting discovery
    .post("/crafting/mix", async (context:RequestParams): Promise<CraftingMixResponse> => {

        const { body, apiUser, db: DB } = context;
        const { pot } = body;

        if (!pot?.length) return { error: "No Pot" };

        let craftingHistory: string[] = [];
        if (apiUser?.id) {
            const userData = await DB.users.get(apiUser.id, { "modules.inventory": 1 });
            craftingHistory = ((userData?.modules?.inventory ?? []) as Array<InventoryItem>)
                .filter((x: any) => x.crafted > 0)
                .map((i: any) => i.id);
        }

        const potTypeMap = pot.map((i: CraftingMaterialItem) => i.type);

        // material query clauses can either specify id/count pairs or a size-only object
        type MaterialClause =
            | { "materials.id": string; "materials.count": { $lte: number } }
            | { materials: { $size: number } };

        const queryExact = {
            $or: [
                { materials: { $size: pot.length, $all: pot.map((i: CraftingMaterialItem) => i.id) } },
                {
                    $and: [
                        ...pot.map<MaterialClause>((itm: CraftingMaterialItem) => ({
                            "materials.id": itm.id,
                            "materials.count": { $lte: itm.count },
                        })),
                        { materials: { $size: pot.length } } as MaterialClause,
                    ],
                },
            ],
            crafted: true,
        };
        const queryBroad = {
            $or: [
                { materials: { $all: pot.map((i: CraftingMaterialItem) => i.id) } },
                { "materials.id": { $all: pot.map((i: CraftingMaterialItem) => i.id) } },
            ],
            crafted: true,
        };

        let possible: InventoryItem[] = [];
        const isExactMatch = ((await DB.items.countDocuments(queryExact)) > 0);
        const isBroadMatch = isExactMatch || ((await DB.items.countDocuments(queryBroad)) > 0);

        if (!isBroadMatch) {
            // type-craft fallback
            const refinedPot = pot.map((item: CraftingMaterialItem) => ({
                ...item,
                count: item.count * ((RARITY_VALUES.indexOf(item.rarity as Rarity) + 1) / 2),
            }));
            const querySameType = {
                $and: pot
                    .map((itm: CraftingMaterialItem) => {
                        const threshold = refinedPot
                            .filter((i: CraftingMaterialItem) => i.type === itm.type)
                            .reduce((a, b) => ({ count: a.count + b.count }), { count: 0 })?.count ?? 0;
                        return { "typeCraft.count": { $lte: threshold }, "typeCraft.type": itm.type };
                    })
                    .concat([{ "typeCraft.type": { $all: potTypeMap } } as any]),
                crafted: true,
            };

            const isSameTypeMatch = await DB.items.countDocuments(querySameType) > 0;

            const potSorted = [...pot].sort(
                // descending rarity
                (a: InventoryItem, b: InventoryItem) => -rarityCompare(a, b)
            );
            const highestRar = potSorted[0]?.rarity as Rarity;
            const lowestRar = potSorted[pot.length - 1]?.rarity as Rarity;

            
            if (isSameTypeMatch) {
                possible = (await DB.items.find(querySameType).lean().exec()) as unknown as InventoryItem[];

                possible = possible.filter((x: InventoryItem) => {
                    const rarityIndex: number = RARITY_VALUES.indexOf(x.rarity as Rarity);
                    return (
                        rarityIndex >= (RARITY_VALUES.indexOf(lowestRar) || 1) &&
                        rarityIndex <= RARITY_VALUES.indexOf(highestRar)
                    );
                });
            }

            if (possible.length) {
                possible = [shuffle(possible)[0]!];
                return {
                    discovery: possible[0]!,
                    isDiscovery: !craftingHistory.includes(possible[0]!.id),
                    canCraftNow: true,
                    typeCraft: true,
                };
            } else {

                // last resort — any item with matching types
                possible = await DB.items
                    .find({ "typeCraft.type": { $all: potTypeMap } })
                    .lean()
                    .exec() as unknown as InventoryItem[];
                if (!possible.length) return { possible: 0, noMoreTable: true };

                const fallback = shuffle(possible)[0]!;
                return {
                    discovery: fallback,
                    isDiscovery: !craftingHistory.includes(fallback.id),
                    canCraftNow: false,
                    typeCraft: true,
                    notQuite: true,
                };
            }
        }

        // Prefer the most exact match if multiple
        if (isExactMatch) {
            possible = await DB.items.find(queryExact).lean().exec() as unknown as InventoryItem[];
            if (possible.length > 1) {
                possible = [
                    possible.sort((a: InventoryItem, b: InventoryItem) => {
                        const r = rarityCompare(a, b);
                        if (r !== 0) return r;

                        const materialsA = a.materials ?? [];
                        const aFits = materialsA.every((m) =>
                            m.count <= (findInPot(m.id, pot)?.count ?? 0)
                        );
                        if (aFits) return -1;

                        // preserve rarity tie-breaker (zero) to keep stable sort
                        return 0;
                    })[0]!,
                ];
            }
        }

        if (possible[0]) {
            const [discovery] = possible;
            const canCraftNow = isExact(pot, discovery?.materials);
            const isDiscovery = !craftingHistory.includes(discovery?.id);
            return { discovery, isDiscovery, canCraftNow };
        }

        return { error: "No recipe found" };
    },{
        body: t.Object({
            pot: t.Array(
                t.Object({
                    id:    t.String({ description: "Material item id" }),
                    count: t.Number({ description: "Quantity of that item" }),
                    type:  t.Optional(t.String({ description: "Item type for type‑crafting" })),
                    rarity:t.Optional(t.String({ description: "Item rarity (C,U,R,…)" })),
                })
            ),
        })
    })

    // POST /api/crafting/create  (alias: /craft) — execute a craft
    .post("/crafting/create", async ({ body, apiUser, requireAuth, db, set }: { body: CraftBody; apiUser?: ApiUser; requireAuth: () => void; db: DbClient; set: any }) => {
        requireAuth();
        const DB = db;
        const { pot, item } = body;

        const itemToCraft = await DB.items.get({ id: item });
        if (!itemToCraft?.crafted) {
            set.status = 403;
            return { status: "ERROR", message: "This item can't be crafted" };
        }

        const userData = await DB.users.getFull(apiUser.id);
        if (!userData) {
            set.status = 401;
            return { status: "ERROR", message: "Not Logged in" };
        }

        const materials = pot ?? itemToCraft.materials;
        for (const itm of materials) {
            const has = userData.modules.inventory.find((i: any) => i.id === itm.id);
            if (!has || has.count < itm.count) {
                set.status = 403;
                return {
                    status: "ERROR",
                    message: `You don't have enough of [${itm.id}]`,
                };
            }
        }

        await Promise.all(materials.map((m: any) => userData.removeItem(m.id, m.count)));
        await Promise.all([
            userData.addItem(item, 1, true),
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

        return { status: "OK", message: "Item has been crafted", inventory: userData.modules.inventory };
    }, {
        body: t.Object({
            item: t.String(),
            pot: t.Optional(t.Array(t.Object({ id: t.String(), count: t.Number() }))),
        }),
    })

    // Alias: /craft
    .post("/crafting/craft", async ({ body, apiUser, requireAuth, db, set }: { body: CraftBody; apiUser?: ApiUser; requireAuth: () => void; db: DbClient; set: any }) => {
        requireAuth();
        const DB = db;
        const { pot, item } = body;

        const itemToCraft = await DB.items.get({ id: item });
        if (!itemToCraft?.crafted) {
            set.status = 403;
            return { status: "ERROR", message: "This item can't be crafted" };
        }

        const userData = await DB.users.getFull(apiUser.id);
        if (!userData) {
            set.status = 401;
            return { status: "ERROR", message: "Not Logged in" };
        }

        const materials = pot ?? itemToCraft.materials;
        for (const itm of materials) {
            const has = userData.modules.inventory.find((i: any) => i.id === itm.id);
            if (!has || has.count < itm.count) {
                set.status = 403;
                return {
                    status: "ERROR",
                    message: `You don't have enough of [${itm.id}]`,
                };
            }
        }

        await Promise.all(materials.map((m: any) => userData.removeItem(m.id, m.count)));
        await Promise.all([
            userData.addItem(item, 1, true),
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

        return { status: "OK", message: "Item has been crafted", inventory: userData.modules.inventory };
    }, {
        body: t.Object({
            item: t.String(),
            pot: t.Optional(t.Array(t.Object({ id: t.String(), count: t.Number() }))),
        }),
    });

        function findInPot(id: string, pot: CraftingMaterialItem[]): CraftingMaterialItem | undefined {
            return pot.find((i: CraftingMaterialItem) => i.id === id);
        }