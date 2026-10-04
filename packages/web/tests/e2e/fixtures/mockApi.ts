import type { Page, Route } from '@playwright/test';
import { adminUsers, dashboard, orders, products } from './mockData';
import type { Order } from '../../../src/types';

const json = async (route: Route, body: unknown, status = 200): Promise<void> => {
  await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
};

const paginate = <T extends Record<string, unknown>>(items: T[], url: URL) => {
  const page = Number(url.searchParams.get('page') ?? '1');
  const limit = Number(url.searchParams.get('limit') ?? '10');
  const search = (url.searchParams.get('search') ?? '').toLowerCase();
  const category = url.searchParams.get('category');
  const sortBy = url.searchParams.get('sortBy');
  const sortOrder = url.searchParams.get('sortOrder');

  let filtered = [...items];
  if (search) filtered = filtered.filter((item) => String(item.name ?? '').toLowerCase().includes(search));
  if (category) filtered = filtered.filter((item) => String((item.category as { name?: string } | undefined)?.name ?? '') === category);
  if (sortBy === 'price') filtered.sort((a, b) => Number(a.price ?? 0) - Number(b.price ?? 0));
  if (sortBy === 'name') filtered.sort((a, b) => String(a.name ?? '').localeCompare(String(b.name ?? '')));
  if (sortBy === 'newest') filtered.sort((a, b) => String(b.createdAt ?? '').localeCompare(String(a.createdAt ?? '')));
  if (sortOrder === 'desc') filtered.reverse();
  const start = (page - 1) * limit;
  return { data: filtered.slice(start, start + limit), pagination: { page, limit, total: filtered.length } };
};

export const installMockApi = async (page: Page): Promise<void> => {
  let cart = { items: [] as Array<{ id: string; product: (typeof products)[number]; quantity: number }>, total: 0 };
  let adminProducts = [...products];
  let dynamicOrders = [...orders];

  const recalcCart = (): void => {
    cart = { items: cart.items, total: cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0) };
  };

  await page.route('**/env.js', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/javascript', body: "window.__APP_ENV__ = { VITE_API_URL: 'http://mock.api', VITE_STRIPE_PUBLISHABLE_KEY: 'pk_test_dummy', VITE_ENABLE_PROFILER: 'false' };" });
  });

  await page.route('http://mock.api/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    const method = request.method();

    if (path === '/auth/login' && method === 'POST') {
      const body = request.postDataJSON() as { email: string };
      const role = body.email.includes('admin') ? 'admin' : 'user';
      return json(route, { token: 'jwt-token', refreshToken: 'refresh-token', user: { id: role === 'admin' ? 'admin-1' : 'user-1', email: body.email, firstName: role === 'admin' ? 'Admin' : 'Jane', lastName: role === 'admin' ? 'User' : 'Customer', role, addresses: [{ street: '12 Oak St', city: 'Seattle', state: 'WA', zip: '98104', country: 'US' }], notificationPreferences: { emailUpdates: true, orderAlerts: true, marketing: false } } });
    }
    if (path === '/auth/register' && method === 'POST') {
      const body = request.postDataJSON() as { email: string; firstName: string; lastName: string };
      return json(route, { token: 'jwt-token', refreshToken: 'refresh-token', user: { id: 'user-new', email: body.email, firstName: body.firstName, lastName: body.lastName, role: 'user' } });
    }
    if (path === '/auth/refresh' && method === 'POST') {
      return json(route, { token: 'jwt-token-refreshed', refreshToken: 'refresh-token-2', user: { id: 'user-1', email: 'jane@example.com', firstName: 'Jane', lastName: 'Customer', role: 'user' } });
    }
    if (path === '/products' && method === 'GET') return json(route, paginate(products as unknown as Array<Record<string, unknown>>, url));
    if (path.startsWith('/products/') && method === 'GET') return json(route, products.find((entry) => entry.id === path.split('/').pop()) ?? products[0]);
    if (path === '/cart' && method === 'GET') { recalcCart(); return json(route, cart); }
    if (path === '/cart' && method === 'DELETE') { cart = { items: [], total: 0 }; return json(route, cart); }
    if (path === '/cart/items' && method === 'POST') {
      const body = request.postDataJSON() as { productId: string; quantity: number };
      const product = products.find((entry) => entry.id === body.productId) ?? products[0]!;
      const existing = cart.items.find((item) => item.product.id === body.productId);
      if (existing) existing.quantity += body.quantity; else cart.items.push({ id: body.productId, product, quantity: body.quantity });
      recalcCart();
      return json(route, cart);
    }
    if (path.startsWith('/cart/items/') && method === 'PUT') {
      const itemId = path.split('/').pop() ?? '';
      const body = request.postDataJSON() as { quantity: number };
      cart.items = cart.items.map((item) => item.id === itemId ? { ...item, quantity: body.quantity } : item).filter((item) => item.quantity > 0);
      recalcCart();
      return json(route, cart);
    }
    if (path.startsWith('/cart/items/') && method === 'DELETE') {
      const itemId = path.split('/').pop() ?? '';
      cart.items = cart.items.filter((item) => item.id !== itemId);
      recalcCart();
      return json(route, cart);
    }
    if (path === '/orders' && method === 'POST') {
      const body = request.postDataJSON() as { shippingAddress: unknown };
      const order: Order = { id: `order-${dynamicOrders.length + 1003}`, status: 'pending', items: [...cart.items], totalAmount: cart.total, createdAt: new Date().toISOString(), shippingAddress: body.shippingAddress as Order['shippingAddress'] };
      dynamicOrders = [order, ...dynamicOrders];
      return json(route, order, 201);
    }
    if (path === '/orders' && method === 'GET') return json(route, { data: dynamicOrders, pagination: { page: 1, limit: 10, total: dynamicOrders.length } });
    if (path.endsWith('/cancel') && method === 'POST') {
      const orderId = path.split('/')[2] ?? '';
      dynamicOrders = dynamicOrders.map((entry) => entry.id === orderId ? { ...entry, status: 'cancelled' } : entry);
      return json(route, dynamicOrders.find((entry) => entry.id === orderId));
    }
    if (path.endsWith('/return') && method === 'POST') {
      const orderId = path.split('/')[2] ?? '';
      dynamicOrders = dynamicOrders.map((entry) => entry.id === orderId ? { ...entry, status: 'refunded' } : entry);
      return json(route, dynamicOrders.find((entry) => entry.id === orderId));
    }
    if (path.endsWith('/pay') && method === 'POST') return json(route, { paymentIntentId: 'pi_mock_123', status: 'requires_confirmation', clientSecret: 'pi_secret_mock' });
    if (path.endsWith('/pay/confirm') && method === 'POST') {
      const orderId = path.split('/')[2] ?? '';
      dynamicOrders = dynamicOrders.map((entry) => entry.id === orderId ? { ...entry, status: 'paid' } : entry);
      return json(route, { status: 'succeeded', order: dynamicOrders.find((entry) => entry.id === orderId) });
    }
    if (path.startsWith('/orders/') && method === 'GET') return json(route, dynamicOrders.find((entry) => entry.id === (path.split('/').pop() ?? '')) ?? dynamicOrders[0]);
    if (path === '/users/me' && method === 'GET') return json(route, { id: 'user-1', email: 'jane@example.com', firstName: 'Jane', lastName: 'Customer', role: 'user', addresses: [{ street: '12 Oak St', city: 'Seattle', state: 'WA', zip: '98104', country: 'US' }], notificationPreferences: { emailUpdates: true, orderAlerts: true, marketing: false } });
    if (path === '/users/me' && method === 'PUT') return json(route, { id: 'user-1', role: 'user', ...(request.postDataJSON() as object) });
    if (path === '/users/me/password' && method === 'POST') return json(route, { ok: true });
    if (path === '/admin/dashboard' && method === 'GET') return json(route, dashboard);
    if (path === '/admin/users' && method === 'GET') return json(route, adminUsers);
    if (path === '/admin/orders' && method === 'GET') return json(route, { data: dynamicOrders, pagination: { page: 1, limit: 10, total: dynamicOrders.length } });
    if (path === '/admin/products' && method === 'GET') return json(route, { data: adminProducts, pagination: { page: 1, limit: 50, total: adminProducts.length } });
    if (path === '/admin/products' && method === 'POST') {
      const body = request.postDataJSON() as Record<string, unknown>;
      const next = { id: `product-${adminProducts.length + 1}`, inventory: 0, description: '', imageUrl: '', price: 0, name: 'New Product', ...body } as (typeof products)[number];
      adminProducts = [next, ...adminProducts];
      return json(route, next, 201);
    }
    if (path.startsWith('/admin/products/') && method === 'PUT') {
      const productId = path.split('/').pop() ?? '';
      const body = request.postDataJSON() as Record<string, unknown>;
      adminProducts = adminProducts.map((product) => product.id === productId ? { ...product, ...body } as (typeof products)[number] : product);
      return json(route, adminProducts.find((product) => product.id === productId));
    }
    if (path.startsWith('/admin/products/') && method === 'DELETE') {
      const productId = path.split('/').pop() ?? '';
      adminProducts = adminProducts.filter((product) => product.id !== productId);
      return json(route, { ok: true });
    }
    return json(route, { error: { code: 'NOT_FOUND', message: `Unhandled route: ${method} ${path}` } }, 404);
  });
};
