import { apiClient } from '@/api/client';
import type { Order, PaginatedResponse, UserAddress } from '@/types';

export const orderService = {
  async create(shippingAddress: UserAddress): Promise<Order> {
    const response = await apiClient.post<Order>('/orders', { shippingAddress });
    return response.data;
  },
  async list(page = 1, limit = 10): Promise<PaginatedResponse<Order>> {
    const response = await apiClient.get<PaginatedResponse<Order>>('/orders', { params: { page, limit } });
    return response.data;
  },
  async detail(orderId: string): Promise<Order> {
    const response = await apiClient.get<Order>(`/orders/${orderId}`);
    return response.data;
  },
  async cancel(orderId: string): Promise<Order> {
    const response = await apiClient.post<Order>(`/orders/${orderId}/cancel`);
    return response.data;
  },
  async requestReturn(orderId: string): Promise<Order> {
    const response = await apiClient.post<Order>(`/orders/${orderId}/return`);
    return response.data;
  },
};
