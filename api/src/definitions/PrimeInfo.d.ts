export type PrimeInfo = {
    tier: PrimeTier;
    lastClaimed: number;
    active: boolean;
    maxServers: number;
    canReallocate: boolean;
    custom_background: boolean;
    custom_handle: boolean;
    custom_shop: boolean;
    servers: string[];
    misc?: unknown;
};
