export type UserRole = 'user' | 'admin';

export interface Category {
  id: string;
  name: string;
}

export interface Review {
  id: string;
  rating: number;
  title?: string;
  comment?: string;
  createdAt?: string;
  author?: {
    id?: string;
    name?: string;
  };
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  inventory: number;
  createdAt?: string;
  rating?: number;
  sku?: string;
  category?: Category;
  reviews?: Review[];
}

export interface UserAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface NotificationPreferences {
  emailUpdates: boolean;
  orderAlerts: boolean;
  marketing: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
  phone?: string;
  addresses?: UserAddress[];
  notificationPreferences?: NotificationPreferences;
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: UserProfile;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
}

export type OrderStatus = 'pending' | 'processing' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

export interface Order {
  id: string;
  userId?: string;
  status: OrderStatus;
  items: CartItem[];
  totalAmount: number;
  createdAt: string;
  shippingAddress?: UserAddress;
}

export interface ApiErrorPayload {
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
  message?: string;
}

export interface PaymentIntentResponse {
  clientSecret?: string;
  paymentIntentId?: string;
  status: string;
  order?: Order;
}

export interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  recentOrders: Order[];
}

export interface AdminUserRecord extends UserProfile {
  createdAt?: string;
  orderCount?: number;
  totalSpent?: number;
}

export interface SessionSnapshot {
  accessToken: string;
  refreshToken?: string;
  rememberMe: boolean;
  user: UserProfile;
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  sortBy?: 'price' | 'name' | 'newest';
  sortOrder?: 'asc' | 'desc';
}
