import { loginSchema, registerSchema } from '@/utils/validators';

describe('validators', () => {
  it('accepts valid login payloads', () => {
    expect(() => loginSchema.parse({ email: 'user@example.com', password: 'password123' })).not.toThrow();
  });

  it('rejects mismatched passwords', () => {
    expect(() => registerSchema.parse({ email: 'user@example.com', password: 'password123', confirmPassword: 'password124', firstName: 'Ada', lastName: 'Lovelace' })).toThrow();
  });
});
