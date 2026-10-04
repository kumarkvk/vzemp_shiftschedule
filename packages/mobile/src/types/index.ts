export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: UserRole;
  addresses?: Address[];
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  authorName: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  images?: string[];
  inventory: number;
  category: Category;
  reviews?: Review[];
  rating?: number;
  featured?: boolean;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
}

export interface ProductListResponse {
  data: Product[];
  pagination: Pagination;
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

export type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  items: CartItem[];
  shippingAddress: Address;
  totalAmount: number;
  createdAt: string;
  trackingNumber?: string;
}

export interface OrdersResponse {
  data: Order[];
  pagination: Pagination;
}

export interface AuthSession {
  accessToken: string;
  refreshToken?: string;
  user: User;
}

export interface ApiErrorPayload {
  error?: {
    code?: string;
    message?: string;
    details?: unknown[];
  };
  message?: string;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  status: string;
  paymentIntentId?: string;
}

export interface AdminDashboard {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  recentOrders: Order[];
}
