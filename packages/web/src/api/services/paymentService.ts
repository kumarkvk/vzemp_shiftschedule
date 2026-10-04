import { apiClient } from '@/api/client';
import type { PaymentIntentResponse } from '@/types';

export const paymentService = {
  async createPaymentIntent(orderId: string, paymentMethodId: string): Promise<PaymentIntentResponse> {
    const response = await apiClient.post<PaymentIntentResponse>(`/orders/${orderId}/pay`, { paymentMethodId });
    return response.data;
  },
  async confirm(orderId: string, paymentIntentId: string): Promise<PaymentIntentResponse> {
    const response = await apiClient.post<PaymentIntentResponse>(`/orders/${orderId}/pay/confirm`, { paymentIntentId });
    return response.data;
  },
};
