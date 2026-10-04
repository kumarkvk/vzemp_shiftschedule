import type { AppServices } from '../../src/types/services';
import { fixtures, paginated } from './fixtures';

export interface MockServices extends AppServices {
  authService: {
    register: jest.Mock;
    login: jest.Mock;
    refreshToken: jest.Mock;
  };
  productService: {
    listProducts: jest.Mock;
    getProductById: jest.Mock;
    createProduct: jest.Mock;
    updateProduct: jest.Mock;
    deleteProduct: jest.Mock;
  };
  categoryService: {
    listCategories: jest.Mock;
    getCategoryById: jest.Mock;
    createCategory: jest.Mock;
    updateCategory: jest.Mock;
    deleteCategory: jest.Mock;
  };
  cartService: {
    getCart: jest.Mock;
    addItem: jest.Mock;
    updateItem: jest.Mock;
    removeItem: jest.Mock;
    clearCart: jest.Mock;
  };
  orderService: {
    listUserOrders: jest.Mock;
    createOrder: jest.Mock;
    getOrderById: jest.Mock;
    updateOrderStatus: jest.Mock;
    listAllOrders: jest.Mock;
  };
  paymentService: {
    createPaymentIntent: jest.Mock;
    confirmPayment: jest.Mock;
    handleWebhook: jest.Mock;
  };
  userService: {
    getProfile: jest.Mock;
    updateProfile: jest.Mock;
    getUserById: jest.Mock;
    listUsers: jest.Mock;
  };
  adminService: {
    getDashboard: jest.Mock;
  };
  healthService: {
    checkLiveness: jest.Mock;
    checkReadiness: jest.Mock;
  };
}

export const createMockServices = (): MockServices => ({
  authService: {
    register: jest.fn(async () => ({ user: fixtures.user, tokens: { accessToken: 'access', refreshToken: 'refresh', expiresIn: '7d' } })),
    login: jest.fn(async () => ({ user: fixtures.user, tokens: { accessToken: 'access', refreshToken: 'refresh', expiresIn: '7d' } })),
    refreshToken: jest.fn(async () => ({ user: fixtures.user, tokens: { accessToken: 'access-2', refreshToken: 'refresh-2', expiresIn: '7d' } })),
  },
  productService: {
    listProducts: jest.fn(async () => paginated([fixtures.product])),
    getProductById: jest.fn(async () => fixtures.product),
    createProduct: jest.fn(async () => fixtures.product),
    updateProduct: jest.fn(async () => fixtures.product),
    deleteProduct: jest.fn(async () => undefined),
  },
  categoryService: {
    listCategories: jest.fn(async () => [fixtures.category]),
    getCategoryById: jest.fn(async () => fixtures.category),
    createCategory: jest.fn(async () => fixtures.category),
    updateCategory: jest.fn(async () => fixtures.category),
    deleteCategory: jest.fn(async () => undefined),
  },
  cartService: {
    getCart: jest.fn(async () => fixtures.cart),
    addItem: jest.fn(async () => fixtures.cart),
    updateItem: jest.fn(async () => fixtures.cart),
    removeItem: jest.fn(async () => undefined),
    clearCart: jest.fn(async () => undefined),
  },
  orderService: {
    listUserOrders: jest.fn(async () => paginated([fixtures.order])),
    createOrder: jest.fn(async () => fixtures.order),
    getOrderById: jest.fn(async () => fixtures.order),
    updateOrderStatus: jest.fn(async () => ({ ...fixtures.order, status: 'paid' as const })),
    listAllOrders: jest.fn(async () => paginated([fixtures.order])),
  },
  paymentService: {
    createPaymentIntent: jest.fn(async () => ({ clientSecret: 'secret', paymentIntentId: 'pi_test_123', status: 'requires_confirmation' })),
    confirmPayment: jest.fn(async () => ({ status: 'succeeded', order: fixtures.order, payment: fixtures.payment })),
    handleWebhook: jest.fn(async () => ({ received: true, eventType: 'payment_intent.succeeded:succeeded' })),
  },
  userService: {
    getProfile: jest.fn(async () => fixtures.user),
    updateProfile: jest.fn(async () => fixtures.user),
    getUserById: jest.fn(async () => fixtures.user),
    listUsers: jest.fn(async () => paginated([fixtures.user, fixtures.adminUser])),
  },
  adminService: {
    getDashboard: jest.fn(async () => fixtures.dashboard),
  },
  healthService: {
    checkLiveness: jest.fn(() => ({ status: 'ok' as const, timestamp: new Date('2024-01-01T00:00:00.000Z').toISOString() })),
    checkReadiness: jest.fn(async () => ({ status: 'ready' as const, database: 'ok' as const, timestamp: new Date('2024-01-01T00:00:00.000Z').toISOString() })),
  },
});
