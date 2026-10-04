import { apiClient } from '@/api/client';
import type { Cart } from '@/types';

export const cartService = {
  async get(): Promise<Cart> {
    const response = await apiClient.get<Cart>('/cart');
    return response.data;
  },
  async add(productId: string, quantity: number): Promise<Cart> {
    const response = await apiClient.post<Cart>('/cart/items', { productId, quantity });
    return response.data;
  },
  async update(itemId: string, quantity: number): Promise<Cart> {
    const response = await apiClient.put<Cart>(`/cart/items/${itemId}`, { quantity });
    return response.data;
  },
  async remove(itemId: string): Promise<void> {
    await apiClient.delete(`/cart/items/${itemId}`);
  },
  async clear(): Promise<void> {
    await apiClient.delete('/cart');
  },
};
