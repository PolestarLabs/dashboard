import { apiClient } from './client';
import type { MarketplaceListing, MarketplaceListParams } from './types';

export async function getMarketplaceListings(
  params: MarketplaceListParams = {},
): Promise<MarketplaceListing[]> {
  const { data } = await apiClient.get<MarketplaceListing[]>('/marketplace', { params });
  return data;
}

