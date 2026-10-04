import { apiClient } from '@/services/api/client';
import type { Cart } from '@/types';

export async function getCart(): Promise<Cart> {
  const { data } = await apiClient.get<Cart>('/cart');
  return data;
}

export async function addToCart(payload: { productId: string; quantity: number }): Promise<Cart> {
  await apiClient.post('/cart/items', payload);
  return getCart();
}

export async function updateCartItem(itemId: string, quantity: number): Promise<Cart> {
  await apiClient.post('/cart/items', { itemId, quantity });
  return getCart();
}

export async function removeCartItem(itemId: string): Promise<Cart> {
  await apiClient.delete(`/cart/items/${itemId}`);
  return getCart();
}

export async function clearCart(): Promise<void> {
  await apiClient.delete('/cart');
}
