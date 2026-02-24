import { RARITY_VALUES } from "@definitions/Rarity";
import { t } from "elysia";


// ── Shared sub-schemas ───────────────────────────────────────────────────────

export const PotItemSchema = t.Object({
    id:     t.String({ description: "Material item id" }),
    count:  t.Number({ description: "Quantity of that item" }),
    type:   t.Optional(t.String({ description: "Item type for type-crafting" })),
    rarity: t.Optional(t.String({ description: RARITY_VALUES.join(" | ") })),
});
export type PotItem = typeof PotItemSchema.static;

// ── Mix ──────────────────────────────────────────────────────────────────────

export const MixBodySchema = t.Object({
    pot: t.Array(PotItemSchema, { description: "Materials to throw in the pot" }),
});
export type MixBody = typeof MixBodySchema.static;

export const MixResponseSchema = t.Unsafe({
    description: "Crafting discovery result",
    type: "object",
    properties: {
        discovery:   { type: "object", description: "The discovered/crafted item", properties: { id: { type: "string", examples: ["item_sword"] }, name: { type: "string", examples: ["Iron Sword"] }, rarity: { type: "string", examples: ["R"] } } },
        isDiscovery: { type: "boolean", description: "True if first time the user discovers this recipe" },
        canCraftNow: { type: "boolean", description: "True if user has the exact materials to craft right now" },
        typeCraft:   { type: "boolean", description: "True if match was type-based rather than exact" },
        notQuite:    { type: "boolean", description: "True if a fallback item was returned but requirements aren't fully met" },
        noMoreTable: { type: "boolean", description: "True if the pot types have no matchable items at all" },
    },
});

export type MixResponse = {
    discovery?:   { id: string; name?: string; rarity?: string };
    isDiscovery?: boolean;
    canCraftNow?: boolean;
    typeCraft?:   boolean;
    notQuite?:    boolean;
    noMoreTable?: boolean;
    error?:       string;
};

// ── Create / Craft ───────────────────────────────────────────────────────────

export const CreateBodySchema = t.Object({
    item: t.String({ description: "Item id to craft" }),
    pot:  t.Optional(t.Array(t.Object({
        id:    t.String(),
        count: t.Number(),
    }), { description: "Override material list; defaults to the item's stored recipe" })),
});
export type CreateBody = typeof CreateBodySchema.static;

export const CreateResponseSchema = t.Object({
    status:    t.String({ examples: ["OK", "ERROR"] }),
    message:   t.String(),
    inventory: t.Optional(t.Array(t.Unknown())),
});
export type CreateResponse = typeof CreateResponseSchema.static;

// ── Item lookup ──────────────────────────────────────────────────────────────

export const ItemParamsSchema = t.Object({ item: t.String({ description: "Item id" }) });
export type ItemParams = typeof ItemParamsSchema.static;
