import { apiClient } from '@/api/client';
import type { AdminUserRecord, DashboardStats, Order, PaginatedResponse, Product } from '@/types';

export const adminService = {
  async dashboard(): Promise<DashboardStats> {
    const response = await apiClient.get<DashboardStats>('/admin/dashboard');
    return response.data;
  },
  async listUsers(): Promise<AdminUserRecord[]> {
    const response = await apiClient.get<AdminUserRecord[]>('/admin/users');
    return response.data;
  },
  async updateUser(userId: string, payload: Partial<AdminUserRecord>): Promise<AdminUserRecord> {
    const response = await apiClient.put<AdminUserRecord>(`/admin/users/${userId}`, payload);
    return response.data;
  },
  async deleteUser(userId: string): Promise<void> {
    await apiClient.delete(`/admin/users/${userId}`);
  },
  async listOrders(): Promise<PaginatedResponse<Order>> {
    const response = await apiClient.get<PaginatedResponse<Order>>('/admin/orders');
    return response.data;
  },
  async listProducts(): Promise<PaginatedResponse<Product>> {
    const response = await apiClient.get<PaginatedResponse<Product>>('/admin/products');
    return response.data;
  },
  async createProduct(payload: Partial<Product> & { categoryId?: string }): Promise<Product> {
    const response = await apiClient.post<Product>('/admin/products', payload);
    return response.data;
  },
  async updateProduct(productId: string, payload: Partial<Product> & { categoryId?: string }): Promise<Product> {
    const response = await apiClient.put<Product>(`/admin/products/${productId}`, payload);
    return response.data;
  },
  async deleteProduct(productId: string): Promise<void> {
    await apiClient.delete(`/admin/products/${productId}`);
  },
};
