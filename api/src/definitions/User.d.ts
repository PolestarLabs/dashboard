
export type { User, User as UserDoc } from "@polestarlabs/database_schema/types";

import type { Currency } from "@polestarlabs/database_schema/types";
import type { Profilecard } from "@polestarlabs/database_schema/types";
import type { PrimeTier } from "@polestarlabs/database_schema/types";

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

