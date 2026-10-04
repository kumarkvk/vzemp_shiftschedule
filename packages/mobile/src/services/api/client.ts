import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

import { env } from '@/config/env';
import { captureError } from '@/services/crashReporting';
import { clearSecureSession, getSecureSession, saveSecureSession } from '@/utils/storage';

type QueueItem = {
  resolve: (token: string | null) => void;
  reject: (error: unknown) => void;
};

let isRefreshing = false;
let requestQueue: QueueItem[] = [];
let unauthorizedHandler: (() => void) | null = null;

export function registerUnauthorizedHandler(handler: () => void): void {
  unauthorizedHandler = handler;
}

function flushQueue(error: unknown, token: string | null = null): void {
  requestQueue.forEach((item) => {
    if (error) {
      item.reject(error);
      return;
    }
    item.resolve(token);
  });
  requestQueue = [];
}

export const apiClient = axios.create({
  baseURL: env.apiUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const session = await getSecureSession();
  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }
  config.headers['X-Mobile-Platform'] = 'expo';
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    captureError(error);
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status !== 401 || originalRequest?._retry) {
      return Promise.reject(error);
    }

    const session = await getSecureSession();
    if (!session?.accessToken) {
      unauthorizedHandler?.();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        requestQueue.push({
          resolve: (token) => {
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(apiClient(originalRequest));
          },
          reject,
        });
      });
    }

    try {
      isRefreshing = true;
      originalRequest._retry = true;
      const refreshResponse = await axios.post(`${env.apiUrl}/auth/refresh`, undefined, {
        headers: {
          Authorization: `Bearer ${session.refreshToken ?? session.accessToken}`,
        },
      });
      const nextSession = {
        ...session,
        accessToken: refreshResponse.data.token,
        refreshToken: refreshResponse.data.refreshToken ?? session.refreshToken,
      };
      await saveSecureSession(nextSession);
      flushQueue(null, nextSession.accessToken);
      originalRequest.headers.Authorization = `Bearer ${nextSession.accessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      flushQueue(refreshError, null);
      await clearSecureSession();
      unauthorizedHandler?.();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
