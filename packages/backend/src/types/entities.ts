export type UserRole = 'user' | 'admin';
export type OrderStatus = 'pending' | 'processing' | 'paid' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'requires_confirmation' | 'succeeded' | 'failed' | 'cancelled';

export interface ShippingAddress {
  fullName?: string;
  street?: string;
  line1?: string;
  line2?: string;
  city: string;
  state: string;
  zip?: string;
  postalCode?: string;
  country: string;
  phone?: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  categoryId: string;
  inventory: number;
  imageUrl: string | null;
  sku: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  category?: Category;
}

export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
  product?: Product;
  subtotal?: number;
}

export interface CartSummary {
  items: CartItem[];
  total: number;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  createdAt: Date;
  product?: Product;
}

export interface Payment {
  id: string;
  orderId: string;
  stripePaymentIntentId: string | null;
  amount: number;
  status: PaymentStatus;
  failureReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  totalAmount: number;
  shippingAddress: ShippingAddress | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  items?: OrderItem[];
  payment?: Payment | null;
}

export interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  activeProducts: number;
}
