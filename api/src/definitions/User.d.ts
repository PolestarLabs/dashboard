

import Profilecard from "./Profilecard";
import Currency from "./Currency";
import { UserInventoryItem } from "./InventoryItem";

export type User = {
    id: string;
    tag: string;
    avatar: string | null;
    level: number;
    exp: number;
    profile: Profilecard;
    prime: any;
    isBlacklisted: boolean;
    //inventorySize: number;
    discordDataUnavailable?: string | null;
    [key in Currency]: number;
}


type UserFull = User & {
    modules: {
        inventory: UserInventoryItem[];
    }
};

