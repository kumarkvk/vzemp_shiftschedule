import { DefaultAdminService } from '../../src/services/admin.service';
import { DefaultAuthService } from '../../src/services/auth.service';
import { DefaultHealthService } from '../../src/services/health.service';
import { DefaultPaymentService } from '../../src/services/payment.service';
import { AuthenticationError, ConflictError, ValidationAppError } from '../../src/errors/AppError';
import { signRefreshToken } from '../../src/utils/jwt';
import { hashPassword } from '../../src/utils/password';
import { fixtures } from '../helpers/fixtures';
import { createMockDatabase } from '../helpers/mock-database';

describe('service layer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('DefaultAuthService', () => {
    it('registers a new user and hashes the password', async () => {
      const database = createMockDatabase();
      const service = new DefaultAuthService(database);

      database.query
        .mockResolvedValueOnce({ rows: [], rowCount: 0 })
        .mockResolvedValueOnce({
          rows: [
            {
              id: fixtures.user.id,
              email: fixtures.user.email,
              first_name: fixtures.user.firstName,
              last_name: fixtures.user.lastName,
              phone: fixtures.user.phone,
              role: fixtures.user.role,
              is_active: true,
              password_hash: await hashPassword('Password123!'),
              created_at: fixtures.user.createdAt,
              updated_at: fixtures.user.updatedAt,
            },
          ],
          rowCount: 1,
        });

      const result = await service.register({
        email: fixtures.user.email,
        password: 'Password123!',
        firstName: fixtures.user.firstName,
        lastName: fixtures.user.lastName,
        phone: fixtures.user.phone ?? undefined,
      });

      expect(result.user.email).toBe(fixtures.user.email);
      expect(result.tokens.accessToken).toBeTruthy();
      expect(result.tokens.refreshToken).toBeTruthy();
      expect(database.query).toHaveBeenCalledTimes(2);
      const insertCall = database.query.mock.calls[1];
      expect(insertCall[1]?.[1]).not.toBe('Password123!');
      expect(String(insertCall[1]?.[1])).toContain('$2');
    });

    it('rejects duplicate registration attempts', async () => {
      const database = createMockDatabase();
      const service = new DefaultAuthService(database);
      database.query.mockResolvedValueOnce({ rows: [{ id: fixtures.user.id }], rowCount: 1 });

      await expect(
        service.register({
          email: fixtures.user.email,
          password: 'Password123!',
          firstName: fixtures.user.firstName,
          lastName: fixtures.user.lastName,
        }),
      ).rejects.toBeInstanceOf(ConflictError);
    });

    it('logs users in with valid credentials', async () => {
      const database = createMockDatabase();
      const service = new DefaultAuthService(database);
      const passwordHash = await hashPassword('Password123!');

      database.query.mockResolvedValueOnce({
        rows: [
          {
            id: fixtures.user.id,
            email: fixtures.user.email,
            first_name: fixtures.user.firstName,
            last_name: fixtures.user.lastName,
            phone: fixtures.user.phone,
            role: fixtures.user.role,
            is_active: true,
            password_hash: passwordHash,
            created_at: fixtures.user.createdAt,
            updated_at: fixtures.user.updatedAt,
          },
        ],
        rowCount: 1,
      });

      const result = await service.login({
        email: fixtures.user.email,
        password: 'Password123!',
      });

      expect(result.user.id).toBe(fixtures.user.id);
      expect(result.tokens.accessToken).toBeTruthy();
    });

    it('rejects invalid passwords during login', async () => {
      const database = createMockDatabase();
      const service = new DefaultAuthService(database);
      const passwordHash = await hashPassword('Password123!');

      database.query.mockResolvedValueOnce({
        rows: [
          {
            id: fixtures.user.id,
            email: fixtures.user.email,
            first_name: fixtures.user.firstName,
            last_name: fixtures.user.lastName,
            phone: fixtures.user.phone,
            role: fixtures.user.role,
            is_active: true,
            password_hash: passwordHash,
            created_at: fixtures.user.createdAt,
            updated_at: fixtures.user.updatedAt,
          },
        ],
        rowCount: 1,
      });

      await expect(
        service.login({
          email: fixtures.user.email,
          password: 'WrongPassword123!',
        }),
      ).rejects.toBeInstanceOf(AuthenticationError);
    });

    it('refreshes tokens for active users', async () => {
      const database = createMockDatabase();
      const service = new DefaultAuthService(database);
      const refreshToken = signRefreshToken({
        id: fixtures.user.id,
        email: fixtures.user.email,
        role: fixtures.user.role,
      });

      database.query.mockResolvedValueOnce({
        rows: [
          {
            id: fixtures.user.id,
            email: fixtures.user.email,
            first_name: fixtures.user.firstName,
            last_name: fixtures.user.lastName,
            phone: fixtures.user.phone,
            role: fixtures.user.role,
            is_active: true,
            password_hash: 'not-used',
            created_at: fixtures.user.createdAt,
            updated_at: fixtures.user.updatedAt,
          },
        ],
        rowCount: 1,
      });

      const result = await service.refreshToken(refreshToken);

      expect(result.user.email).toBe(fixtures.user.email);
      expect(result.tokens.refreshToken).toBeTruthy();
    });
  });

  describe('DefaultAdminService', () => {
    it('maps dashboard aggregates to the API shape', async () => {
      const database = createMockDatabase();
      const service = new DefaultAdminService(database);

      database.query.mockResolvedValueOnce({
        rows: [
          {
            total_users: '10',
            total_orders: '6',
            total_revenue: '1400.55',
            pending_orders: '2',
            active_products: '8',
          },
        ],
        rowCount: 1,
      });

      await expect(service.getDashboard()).resolves.toEqual(fixtures.dashboard);
    });
  });

  describe('DefaultHealthService', () => {
    it('returns a liveness payload', () => {
      const service = new DefaultHealthService(createMockDatabase());

      const result = service.checkLiveness();

      expect(result.status).toBe('ok');
      expect(result.timestamp).toEqual(expect.any(String));
    });

    it('checks database readiness', async () => {
      const database = createMockDatabase();
      const service = new DefaultHealthService(database);
      database.query.mockResolvedValueOnce({ rows: [{ ok: 1 }], rowCount: 1 });

      const result = await service.checkReadiness();

      expect(database.query).toHaveBeenCalledWith('SELECT 1 AS ok');
      expect(result.status).toBe('ready');
      expect(result.database).toBe('ok');
    });
  });

  describe('DefaultPaymentService', () => {
    const createStripeStub = () =>
      ({
        paymentIntents: {
          create: jest.fn(),
          confirm: jest.fn(),
        },
        webhooks: {
          constructEvent: jest.fn(),
        },
      }) as any;

    it('rejects payment intent creation when the order is not payable', async () => {
      const database = createMockDatabase();
      const stripe = createStripeStub();
      const orderService = {
        getOrderById: jest.fn(),
      } as any;
      const service = new DefaultPaymentService(database, stripe, orderService);

      database.query.mockResolvedValueOnce({
        rows: [
          {
            id: fixtures.order.id,
            user_id: fixtures.user.id,
            total_amount: fixtures.order.totalAmount,
            status: 'completed',
          },
        ],
        rowCount: 1,
      });

      await expect(
        service.createPaymentIntent(fixtures.user.id, fixtures.order.id, {}),
      ).rejects.toBeInstanceOf(ValidationAppError);
      expect(stripe.paymentIntents.create).not.toHaveBeenCalled();
    });

    it('rejects webhook handling when the Stripe signature is missing', async () => {
      const database = createMockDatabase();
      const stripe = createStripeStub();
      const orderService = {
        getOrderById: jest.fn(),
      } as any;
      const service = new DefaultPaymentService(database, stripe, orderService);

      await expect(service.handleWebhook(undefined, Buffer.from('{}'))).rejects.toBeInstanceOf(ValidationAppError);
    });
  });
});
