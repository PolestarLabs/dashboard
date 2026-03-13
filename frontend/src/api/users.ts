import { apiClient } from './client';
import type { PublicProfile } from './types';

export async function getPublicUser(id: string): Promise<PublicProfile> {
  const { data } = await apiClient.get<PublicProfile>(`/public/user/${id}`);
  return data;
}

