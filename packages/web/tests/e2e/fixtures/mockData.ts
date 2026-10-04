import type { AdminUserRecord, DashboardStats, Order, Product } from '../../../src/types';

export const products: Product[] = Array.from({ length: 14 }, (_, index) => ({
  id: `product-${index + 1}`,
  name: index === 0 ? 'Noise Cancelling Headphones' : `Demo Product ${index + 1}`,
  description: 'Reliable product data for storefront test coverage.',
  price: 25 + index * 7,
  imageUrl: `https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80&sig=${index + 1}`,
  inventory: 20 - (index % 5),
  createdAt: new Date(Date.now() - index * 86_400_000).toISOString(),
  rating: 4.2,
  category: { id: `cat-${index % 3}`, name: ['Electronics', 'Apparel', 'Home'][index % 3]! },
  reviews: [{ id: `review-${index + 1}`, rating: 5, title: 'Excellent purchase', comment: 'Fast shipping and strong quality.', createdAt: new Date().toISOString(), author: { name: 'Test Shopper' } }],
}));

export const orders: Order[] = [
  { id: 'order-1001', status: 'paid', items: [{ id: 'item-1', product: products[0]!, quantity: 1 }], totalAmount: products[0]!.price, createdAt: new Date().toISOString(), shippingAddress: { street: '1 Main St', city: 'Seattle', state: 'WA', zip: '98101', country: 'US' } },
  { id: 'order-1002', status: 'shipped', items: [{ id: 'item-2', product: products[1]!, quantity: 2 }], totalAmount: products[1]!.price * 2, createdAt: new Date(Date.now() - 86_400_000).toISOString(), shippingAddress: { street: '99 Pine St', city: 'Seattle', state: 'WA', zip: '98102', country: 'US' } },
];

export const dashboard: DashboardStats = { totalUsers: 3250, totalOrders: 812, totalRevenue: 147920, recentOrders: orders };
export const adminUsers: AdminUserRecord[] = [{ id: 'user-1', email: 'admin@example.com', firstName: 'Admin', lastName: 'User', role: 'admin', orderCount: 12, totalSpent: 2490 }];
