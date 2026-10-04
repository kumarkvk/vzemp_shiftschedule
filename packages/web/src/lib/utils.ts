import clsx from 'clsx';
import type { ApiErrorPayload, UserProfile } from '@/types';

export const cn = (...classes: Array<string | false | null | undefined>): string => clsx(classes);

export const currency = (value: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);

export const formatDate = (value?: string): string => {
  if (!value) {
    return '—';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
};

export const titleCase = (value: string): string =>
  value
    .split(/[\s-_]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');

export const initials = (user?: Partial<UserProfile>): string => {
  const first = user?.firstName?.charAt(0) ?? '';
  const last = user?.lastName?.charAt(0) ?? '';
  return `${first}${last}`.toUpperCase() || 'U';
};

export const getErrorMessage = (error: unknown, fallback = 'Something went wrong.'): string => {
  if (!error) {
    return fallback;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  const payload = error as ApiErrorPayload;
  return payload.error?.message ?? payload.message ?? fallback;
};

export const sleep = async (ms: number): Promise<void> => {
  await new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
};

export const isAdmin = (user?: Pick<UserProfile, 'role'> | null): boolean => user?.role === 'admin';
