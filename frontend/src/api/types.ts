export interface AuthUser {
  id: string;
  username: string;
  discriminator?: string;
  avatarUrl?: string | null;
}

export interface PublicProfile {
  id: string;
  meta: {
    username: string;
    avatar: string | null;
  };
  profile: {
    tagline?: string | null;
  };
  currency: {
    RBN: number;
    JDE: number;
    SPH: number;
  };
}

export interface MarketplaceListing {
  id: string;
  name: string;
  price: number;
  type: string;
  img?: string;
}

export interface MarketplaceListParams {
  type?: string;
  skip?: number;
  lim?: number;
}

export interface CosmeticItem {
  id: string;
  name: string;
  type: string;
}

export interface CosmeticSearchParams {
  type?: string;
  lim?: number;
  skip?: number;
  searchq?: string;
}

