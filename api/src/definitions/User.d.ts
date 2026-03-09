

import Profilecard, { ProfileCardDoc } from "./Profilecard";
import Currency from "./Currency";
import { UserInventoryItem } from "./InventoryItem";
import type { PrimeInfo }   from "@definitions/PrimeInfo";
import type { PrimeTier }   from "@definitions/PrimeTier";
import type { Rarity }      from "@definitions/Rarity";



export type ApiUser = {
    id: string;
    tag: string;
    avatar: string | null;
    personalHandle?: string;
    exp: number;
    level: number;
    commends: number;
    profile: Profilecard;
    isPrime: boolean;
    primeTier?: PrimeTier;
    isBlacklisted: boolean;
    inventorySize: number;
    discordDataUnavailable?: string;
    [key in Currency]: number;
}

export type UserDoc = {
    _id: { toString(): string };
    id: string;
    name: string;
    meta: {
        createdAt: Date;
        lastLogin: Date;
        lastUpdated: Date;
        migrated?: boolean;
        apiKey?: string;
        apiPerms?: string;
    };
    currency: Record<Currency, number>;
    progression: {
        level: number;
        exp: number;
    };
    profile: ProfileCardDoc;
    prime?: PrimeInfo;
    blacklisted?: boolean | string;
    switches: Record<string>;
    counters: Record<string>;
    eventData: Record<string>;
    personalHandle?: string;
}

