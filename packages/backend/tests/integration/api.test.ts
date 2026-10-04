import request from 'supertest';
import { createApp } from '../../src/app';
import { signAccessToken } from '../../src/utils/jwt';
import { AppError } from '../../src/errors/AppError';
import { fixtures } from '../helpers/fixtures';
import { createMockServices, type MockServices } from '../helpers/mock-services';

describe('API integration', () => {
  let services: MockServices;
  let userToken: string;
  let adminToken: string;

  beforeEach(() => {
    services = createMockServices();
    userToken = signAccessToken({
      id: fixtures.user.id,
      email: fixtures.user.email,
      role: fixtures.user.role,
    });
    adminToken = signAccessToken({
      id: fixtures.adminUser.id,
      email: fixtures.adminUser.email,
      role: fixtures.adminUser.role,
    });
  });

  it('returns the liveness probe payload', async () => {
    const response = await request(createApp(services)).get('/health/live');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('ok');
  });

  it('returns the readiness probe payload', async () => {
    const response = await request(createApp(services)).get('/health/ready');

    expect(response.status).toBe(200);
    expect(response.body.data.database).toBe('ok');
  });

  it('registers a user through the auth endpoint', async () => {
    const response = await request(createApp(services)).post('/auth/register').send({
      email: fixtures.user.email,
      password: 'Password123!',
      firstName: fixtures.user.firstName,
      lastName: fixtures.user.lastName,
      phone: fixtures.user.phone,
    });

    expect(response.status).toBe(201);
    expect(services.authService.register).toHaveBeenCalledWith(expect.objectContaining({ email: fixtures.user.email }));
  });

  it('validates login requests', async () => {
    const response = await request(createApp(services)).post('/auth/login').send({
      email: 'not-an-email',
      password: 'short',
    });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(services.authService.login).not.toHaveBeenCalled();
  });

  it('lists products with pagination', async () => {
    const response = await request(createApp(services)).get('/products?page=1&limit=10&search=bag');

    expect(response.status).toBe(200);
    expect(response.body.pagination.total).toBe(1);
    expect(services.productService.listProducts).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, limit: 10, search: 'bag' }),
    );
  });

  it('requires authentication for protected product creation', async () => {
    const response = await request(createApp(services)).post('/products').send({
      name: 'New Product',
      price: 12.5,
      categoryId: fixtures.category.id,
      inventory: 4,
      sku: 'SKU-123',
    });

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('UNAUTHORIZED');
  });

  it('allows admins to create products', async () => {
    const response = await request(createApp(services))
      .post('/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'New Product',
        description: 'Created by admin',
        price: 12.5,
        categoryId: fixtures.category.id,
        inventory: 4,
        imageUrl: 'https://example.com/product.png',
        sku: 'SKU-123',
        isActive: true,
      });

    expect(response.status).toBe(201);
    expect(services.productService.createProduct).toHaveBeenCalled();
  });

  it('allows admins to create categories', async () => {
    const response = await request(createApp(services))
      .post('/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Belts',
        description: 'Belts and straps',
        imageUrl: 'https://example.com/belts.png',
      });

    expect(response.status).toBe(201);
    expect(services.categoryService.createCategory).toHaveBeenCalled();
  });

  it('requires authentication to access the cart', async () => {
    const response = await request(createApp(services)).get('/cart');

    expect(response.status).toBe(401);
    expect(response.body.error.message).toBe('Authorization header is required');
  });

  it('returns the authenticated user cart', async () => {
    const response = await request(createApp(services))
      .get('/cart')
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.total).toBe(fixtures.cart.total);
    expect(services.cartService.getCart).toHaveBeenCalledWith(fixtures.user.id);
  });

  it('validates order creation input', async () => {
    const response = await request(createApp(services))
      .post('/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        shippingAddress: {
          city: 'Seattle',
        },
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('creates an order for the authenticated user', async () => {
    const response = await request(createApp(services))
      .post('/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        shippingAddress: fixtures.order.shippingAddress,
        notes: fixtures.order.notes,
      });

    expect(response.status).toBe(201);
    expect(services.orderService.createOrder).toHaveBeenCalledWith(
      fixtures.user.id,
      expect.objectContaining({ shippingAddress: fixtures.order.shippingAddress }),
    );
  });

  it('blocks non-admins from updating order status', async () => {
    const response = await request(createApp(services))
      .put(`/orders/${fixtures.order.id}/status`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ status: 'paid' });

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe('FORBIDDEN');
  });

  it('creates a payment intent for an order', async () => {
    const response = await request(createApp(services))
      .post(`/orders/${fixtures.order.id}/pay`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ paymentMethodId: 'pm_test_123' });

    expect(response.status).toBe(201);
    expect(response.body.data.paymentIntentId).toBe('pi_test_123');
  });

  it('updates the authenticated user profile', async () => {
    const response = await request(createApp(services))
      .put('/users/profile')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        firstName: 'Updated',
        lastName: 'Name',
        phone: '+15550000000',
      });

    expect(response.status).toBe(200);
    expect(services.userService.updateProfile).toHaveBeenCalledWith(
      fixtures.user.id,
      expect.objectContaining({ firstName: 'Updated' }),
    );
  });

  it('returns dashboard statistics for admins', async () => {
    const response = await request(createApp(services))
      .get('/admin/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.totalRevenue).toBe(fixtures.dashboard.totalRevenue);
  });

  it('handles Stripe webhooks with raw payloads', async () => {
    const response = await request(createApp(services))
      .post('/webhook/stripe')
      .set('stripe-signature', 'test-signature')
      .set('content-type', 'application/json')
      .send('{"type":"payment_intent.succeeded"}');

    expect(response.status).toBe(200);
    expect(services.paymentService.handleWebhook).toHaveBeenCalledWith(
      'test-signature',
      expect.any(Buffer),
    );
  });

  it('returns consistent 404 responses', async () => {
    const response = await request(createApp(services)).get('/missing/route');

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('ROUTE_NOT_FOUND');
  });

  it('returns consistent error responses from downstream services', async () => {
    services.productService.getProductById.mockRejectedValueOnce(new AppError('Broken dependency', 503, 'SERVICE_UNAVAILABLE'));

    const response = await request(createApp(services)).get(`/products/${fixtures.product.id}`);

    expect(response.status).toBe(503);
    expect(response.body.error.message).toBe('Broken dependency');
  });
});
