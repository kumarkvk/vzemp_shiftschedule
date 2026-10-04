import { apiClient } from '@/services/api/client';
import type { AdminDashboard, Product } from '@/types';

export async function getDashboard(): Promise<AdminDashboard> {
  const { data } = await apiClient.get<AdminDashboard>('/admin/dashboard');
  return data;
}

export async function getAdminProducts(): Promise<Product[]> {
  const { data } = await apiClient.get<{ data?: Product[] } | Product[]>('/admin/products');
  return Array.isArray(data) ? data : (data.data ?? []);
}

export async function createAdminProduct(payload: Partial<Product>): Promise<Product> {
  const { data } = await apiClient.post<Product>('/admin/products', payload);
  return data;
}

export async function updateAdminProduct(productId: string, payload: Partial<Product>): Promise<Product> {
  const { data } = await apiClient.put<Product>(`/admin/products/${productId}`, payload);
  return data;
}

export async function deleteAdminProduct(productId: string): Promise<void> {
  await apiClient.delete(`/admin/products/${productId}`);
}
