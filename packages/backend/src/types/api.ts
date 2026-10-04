import type { CartSummary, Category, DashboardStats, Order, OrderStatus, Payment, Product, ShippingAddress, User, UserRole } from './entities';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: PaginationMeta;
}

export interface RequestUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface AuthResult {
  user: User;
  tokens: AuthTokens;
}

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface ProductQuery {
  page: number;
  limit: number;
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
}

export interface ProductCreateInput {
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  inventory: number;
  imageUrl?: string;
  sku: string;
  isActive?: boolean;
}

export interface ProductUpdateInput {
  name?: string;
  description?: string | null;
  price?: number;
  categoryId?: string;
  inventory?: number;
  imageUrl?: string | null;
  sku?: string;
  isActive?: boolean;
}

export interface CategoryCreateInput {
  name: string;
  description?: string;
  imageUrl?: string;
}

export interface CategoryUpdateInput {
  name?: string;
  description?: string | null;
  imageUrl?: string | null;
}

export interface CartAddItemInput {
  productId: string;
  quantity: number;
}

export interface CartUpdateItemInput {
  quantity: number;
}

export interface CreateOrderInput {
  shippingAddress: ShippingAddress;
  notes?: string;
}

export interface CreatePaymentIntentInput {
  paymentMethodId?: string;
}

export interface ConfirmPaymentInput {
  paymentIntentId: string;
}

export interface ProfileUpdateInput {
  firstName?: string;
  lastName?: string;
  phone?: string | null;
}

export interface OrderListQuery {
  page: number;
  limit: number;
}

export interface AdminOrderListQuery extends OrderListQuery {
  status?: OrderStatus;
}

export interface AdminUserListQuery extends OrderListQuery {
  role?: UserRole;
}

export interface ApiSuccess<T> {
  success: true;
  message?: string;
  data: T;
  pagination?: PaginationMeta;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResource = AuthResult | User | Product | Category | CartSummary | Order | Payment | DashboardStats;
