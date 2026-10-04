import { apiClient } from '@/services/api/client';
import type { User } from '@/types';

export async function getProfile(): Promise<User> {
  const { data } = await apiClient.get<User>('/users/me');
  return data;
}

export async function updateProfile(payload: Partial<User>): Promise<User> {
  const { data } = await apiClient.put<User>('/users/me', payload);
  return data;
}
