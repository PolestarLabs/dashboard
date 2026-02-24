import { Currency } from "./Currency";
import { RarityType } from "./Rarity";

export interface InventoryItem {
    // Basic
    id: string;
    rarity: RarityType;
    name: string;
    // Meta
    icon: string;
    emoji: string;
    altEmoji: string;
    type: string; //check all possible types in codebase later
    price: number;
    public: boolean;
    crafted: boolean;
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