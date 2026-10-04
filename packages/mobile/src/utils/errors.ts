import axios from 'axios';

import type { ApiErrorPayload } from '@/types';

const defaultMessage = 'Something went wrong. Please try again.';

export function toUserFriendlyError(error: unknown): string {
  if (axios.isAxiosError<ApiErrorPayload>(error)) {
    return error.response?.data?.error?.message ?? error.response?.data?.message ?? error.message ?? defaultMessage;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return defaultMessage;
}
