import { apiClient } from '@/api/client';
import type { NotificationPreferences, UserAddress, UserProfile } from '@/types';

export interface ProfileUpdatePayload extends Partial<UserProfile> {
  addresses?: UserAddress[];
  notificationPreferences?: NotificationPreferences;
  password?: string;
  currentPassword?: string;
}

export const userService = {
  async getProfile(): Promise<UserProfile> {
    const response = await apiClient.get<UserProfile>('/users/me');
    return response.data;
  },
  async updateProfile(payload: ProfileUpdatePayload): Promise<UserProfile> {
    const response = await apiClient.put<UserProfile>('/users/me', payload);
    return response.data;
  },
  async changePassword(currentPassword: string, password: string): Promise<void> {
    await apiClient.post('/users/me/password', { currentPassword, password });
  },
};
