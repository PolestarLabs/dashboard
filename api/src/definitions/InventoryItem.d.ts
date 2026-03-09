import { Currency } from "./Currency";
import type { Rarity } from "./Rarity";

type ItemType = 'boosterpack' | 'box' | 'consumable' | 'key' | 'material' | 'junk' | 'other';
type ItemSeries = 'artifact' | 'booster' | 'consumables' | 'crafting' | 'fishing' | 'gem' | 'event' | 'ring' | 'wtf' | 'other';
type ItemFilter =
    'FLW'       // Flowers+Snowflakes event
    |'SFK'      // Flowers+Snowflakes event
    |'neutral'  // Flowers+Snowflakes event
    |'chibi'    // for Lootbox?
    |'epic'     // for Lootbox?
    |'event'    // Event generic
    |'plx_collection' // for Lootbox or Boosters?


export interface InventoryItem {
    // Basic
    id: string;
    name: string;
    rarity: Rarity;
    type: ItemType;
    // Meta
    icon: string;       // webside png icon
    emoji: string;      // discord emoji (custom or unicode)
    price: number;
    misc: Record<string, unknown>;
    // Flags
    public: boolean;
    tradeable: boolean;
    buyable: boolean;
    destroyable: boolean;
    crafted: boolean;
    // Event
    event?: string;
    // Interactions
    meta: Record<string, unknown>; // usefile can be found here
    code?: string;
    // Crafting
    features?: string; // physical characteristics for generic-use crafting items
    maxBulkCraft?: number; // if present, indicates the max number of times this item can be crafted at once (for bulk crafting), otherwise unlimited
    materials: { id: string; count: number, $size: number }[];
    typeCraft?: Array<{ type:string, count:number }>;   // Advanced Craft
    rewards?: Array<{ type: string, id: string}>;       // Stikerpacks-only
    gemcraft?: {[key in Currency]?: number};
    // Collectability
    series?: ItemSeries;
    filter?: ItemFilter;
    subtype?: string;
    exclusive?: string; // exclusive to a specific server

};

export interface UserInventoryItem {
    id: string;
    count: number;
}