
export type { User, User as UserDoc } from "/api/schema/types";

import type { Currency } from "/api/schema/types";
import type { Profilecard } from "/api/schema/types";
import type { PrimeTier } from "/api/schema/types";

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
} & { [K in Currency]: number };

