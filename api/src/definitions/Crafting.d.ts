/** Crafting-related types shared between routes and services. */

export interface PotItem {
  id: string;
  count: number;
  type?: string;
  rarity?: string;
}

export interface MixBody {
  pot: PotItem[];
}

export interface MixResponse {
  discovery?: { id: string; name?: string; rarity?: string };
  isDiscovery?: boolean;
  canCraftNow?: boolean;
  typeCraft?: boolean;
  notQuite?: boolean;
  noMoreTable?: boolean;
  possible?: number;
  error?: string;
}

export interface CreateBody {
  item: string;
  pot?: { id: string; count: number }[];
}

export interface CreateResponse {
  status: string;
  message: string;
  inventory?: unknown[];
}
