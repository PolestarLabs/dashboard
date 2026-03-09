import type { PrimeTier } from "@definitions/PrimeTiers";

const PRIME_TIERS: readonly PrimeTier[] = [
      "plastic" 
    , "aluminium" 
    , "carbon" , "iron"
    , "iridium", "lithium" 
    , "palladium" 
    , "zircon" 
    , "uranium"
    , "astatine"
    , "antimatter" 
    , "neutrino" 
] as const;
export default PRIME_TIERS;