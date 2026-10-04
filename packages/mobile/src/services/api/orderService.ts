import { apiClient } from '@/services/api/client';
import type { Address, Order, OrdersResponse } from '@/types';

export async function createOrder(shippingAddress: Address): Promise<Order> {
  const { data } = await apiClient.post<Order>('/orders', { shippingAddress });
  return data;
}

export async function listOrders(page = 1, limit = 20): Promise<OrdersResponse> {
  const { data } = await apiClient.get<OrdersResponse>('/orders', {
    params: { page, limit },
  });
  return data;
}

export async function getOrder(orderId: string): Promise<Order> {
  const { data } = await apiClient.get<Order>(`/orders/${orderId}`);
  return data;
}
