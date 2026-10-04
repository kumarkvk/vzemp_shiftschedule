import { apiClient } from '@/services/api/client';
import type { AuthSession, User } from '@/types';

interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: User;
}

export async function login(payload: { email: string; password: string }): Promise<AuthSession> {
  const { data } = await apiClient.post<AuthResponse>('/auth/login', payload);
  return {
    accessToken: data.token,
    refreshToken: data.refreshToken,
    user: data.user,
  };
}

export async function register(payload: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}): Promise<AuthSession> {
  const { data } = await apiClient.post<AuthResponse>('/auth/register', payload);
  return {
    accessToken: data.token,
    refreshToken: data.refreshToken,
    user: data.user,
  };
}

export async function refreshSession(): Promise<string> {
  const { data } = await apiClient.post<{ token: string }>('/auth/refresh');
  return data.token;
}
