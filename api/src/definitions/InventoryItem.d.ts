import { Currency } from "./Currency";
import type { Rarity } from "./Rarity";


export type InventoryItemType =
    'consumable'
    | 'key'
    | 'background'
    | 'medal'
    | 'sticker'
    | 'junk'
    | 'material'
    | 'boosterpack'
    | 'flair'
    | 'skin'
    | 'other';

export interface InventoryItem {
    // Basic
    id: string;
    rarity: Rarity;
    name: string;
    // Meta
    icon: string;
    emoji: string;
    altEmoji: string;
    type: InventoryItemType;
    price: number;
    public: boolean;
    crafted: number;
    misc: Record<string, unknown>;
    // Market
    tradeable: boolean;
    buyable: boolean;
    destroyable: boolean;
    // Event
    event?: string;
    event_id?: number;
    // Interactions
    usefile?: string;
    code?: string;
    // Crafting
    materials: { id: string; count: number, $size: number }[];
    typeCraft?: string[];
    gemcraft?: {
        [key in Currency]?: number;
    };
    // Collectability
    series?: string;
    filter?: string;
    subtype?: string;
    exclusive?: string;

};

export interface UserInventoryItem {
    id: string;
    count: number;
}