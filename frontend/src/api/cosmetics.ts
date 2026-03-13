import { apiClient } from './client';
import type { CosmeticItem, CosmeticSearchParams } from './types';

export async function searchCosmetics(
  params: CosmeticSearchParams = {},
): Promise<CosmeticItem[]> {
  const { data } = await apiClient.get<CosmeticItem[]>('/cosmetics/search', { params });
  return data;
}

export async function countCosmetics(type: string): Promise<number> {
  const { data } = await apiClient.get<{ count: number }>(`/cosmetics/count/${type}`);
  return data.count;
}

