import { apiClient } from '@/services/api/client';
import type { Product, ProductListResponse } from '@/types';

export interface ProductQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  sort?: 'price-asc' | 'price-desc' | 'rating' | 'latest';
}

export async function listProducts(query: ProductQuery): Promise<ProductListResponse> {
  const { data } = await apiClient.get<ProductListResponse>('/products', { params: query });
  return data;
}

export async function getProduct(productId: string): Promise<Product> {
  const { data } = await apiClient.get<Product>(`/products/${productId}`);
  return data;
}
