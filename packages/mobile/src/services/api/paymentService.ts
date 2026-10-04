import { apiClient } from '@/services/api/client';
import type { PaymentIntentResponse } from '@/types';

export async function createPaymentIntent(orderId: string, paymentMethodId: string): Promise<PaymentIntentResponse> {
  const { data } = await apiClient.post<PaymentIntentResponse>(`/orders/${orderId}/pay`, {
    paymentMethodId,
  });
  return data;
}

export async function confirmOrderPayment(orderId: string, paymentIntentId: string): Promise<{ status: string }> {
  const { data } = await apiClient.post<{ status: string }>(`/orders/${orderId}/pay/confirm`, {
    paymentIntentId,
  });
  return data;
}
