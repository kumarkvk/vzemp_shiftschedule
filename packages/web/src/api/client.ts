import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { env } from '@/config/env';
import { authSession } from '@/lib/authSession';
import { reportError } from '@/lib/monitoring';
import { getErrorMessage, sleep } from '@/lib/utils';
import type { ApiErrorPayload, AuthResponse } from '@/types';

declare module 'axios' {
  interface InternalAxiosRequestConfig {
    _retry?: boolean;
    _retryCount?: number;
  }
}

export class ApiClientError extends Error {
  public status?: number;
  public code?: string;
  public details?: unknown;

  public constructor(message: string, status?: number, code?: string, details?: unknown) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const MAX_RETRIES = 2;

const rawClient = axios.create({
  baseURL: env.VITE_API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const resolveAuthPayload = (data: Partial<AuthResponse> & { accessToken?: string; refresh_token?: string }): { accessToken: string; refreshToken?: string } => ({
  accessToken: data.token ?? data.accessToken ?? '',
  refreshToken: data.refreshToken ?? data.refresh_token,
});

const normalizeError = (error: AxiosError<ApiErrorPayload>): ApiClientError => {
  const status = error.response?.status;
  const payload = error.response?.data;
  return new ApiClientError(
    payload?.error?.message ?? payload?.message ?? getErrorMessage(error, 'Request failed.'),
    status,
    payload?.error?.code,
    payload?.error?.details,
  );
};

const shouldRetry = (error: AxiosError<ApiErrorPayload>, config: InternalAxiosRequestConfig): boolean => {
  const method = config.method?.toUpperCase();
  const retryableMethod = method === 'GET' || method === 'HEAD';
  const status = error.response?.status;
  const retryCount = config._retryCount ?? 0;
  return retryableMethod && retryCount < MAX_RETRIES && (!status || status >= 500 || status === 429);
};

let refreshPromise: Promise<string | null> | null = null;

const refreshAccessToken = async (): Promise<string | null> => {
  const currentToken = authSession.getAccessToken();
  if (!currentToken) {
    return null;
  }

  if (!refreshPromise) {
    refreshPromise = rawClient
      .post<AuthResponse | { accessToken: string; refreshToken?: string }>('/auth/refresh', undefined, {
        headers: {
          Authorization: `Bearer ${authSession.getRefreshToken() ?? currentToken}`,
        },
      })
      .then((response) => {
        const { accessToken, refreshToken } = resolveAuthPayload(response.data);
        if (!accessToken) {
          return null;
        }

        authSession.updateTokens(accessToken, refreshToken);
        window.dispatchEvent(new Event('auth:refreshed'));
        return accessToken;
      })
      .catch(() => {
        authSession.clear();
        window.dispatchEvent(new Event('auth:expired'));
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

rawClient.interceptors.request.use((config) => {
  const accessToken = authSession.getAccessToken();
  if (accessToken) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

rawClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorPayload>) => {
    const config = error.config;

    if (!config) {
      const normalized = normalizeError(error);
      reportError(normalized, { area: 'api-client' });
      return Promise.reject(normalized);
    }

    if (shouldRetry(error, config)) {
      config._retryCount = (config._retryCount ?? 0) + 1;
      await sleep(config._retryCount * 300);
      return rawClient(config);
    }

    if (error.response?.status == 401 && !config._retry && !String(config.url).includes('/auth/')) {
      config._retry = true;
      const accessToken = await refreshAccessToken();
      if (accessToken) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${accessToken}`;
        return rawClient(config);
      }
    }

    const normalized = normalizeError(error);
    reportError(normalized, {
      area: 'api-client',
      metadata: {
        method: config.method,
        url: config.url,
        status: error.response?.status,
      },
    });
    return Promise.reject(normalized);
  },
);

export const apiClient = rawClient;
