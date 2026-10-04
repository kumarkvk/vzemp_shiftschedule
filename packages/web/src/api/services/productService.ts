import { apiClient } from '@/api/client';
import type { PaginatedResponse, Product, ProductFilters } from '@/types';

export const productService = {
  async list(filters: ProductFilters = {}): Promise<PaginatedResponse<Product>> {
    const response = await apiClient.get<PaginatedResponse<Product>>('/products', {
      params: {
        page: filters.page ?? 1,
        limit: filters.limit ?? 10,
        search: filters.search,
        category: filters.category,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      },
    });
    return response.data;
  },
  async detail(productId: string): Promise<Product> {
    const response = await apiClient.get<Product>(`/products/${productId}`);
    return response.data;
  },
  async search(query: string): Promise<PaginatedResponse<Product>> {
    return this.list({ search: query, page: 1, limit: 10 });
  },
};
