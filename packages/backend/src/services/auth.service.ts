import { AuthenticationError, ConflictError, NotFoundError } from '../errors/AppError';
import type { LoginInput, RegisterInput } from '../types/api';
import type { Database } from '../types/database';
import type { AuthService } from '../types/services';
import { mapUser } from '../utils/mappers';
import { comparePassword, hashPassword } from '../utils/password';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
interface UserWithPasswordRow { id: string; email: string; first_name: string; last_name: string; phone: string | null; role: 'user' | 'admin'; is_active: boolean; password_hash: string; created_at: Date; updated_at: Date; }
const buildAuthResponse = (userRow: UserWithPasswordRow) => { const user = mapUser(userRow); const tokenPayload = { id: user.id, email: user.email, role: user.role }; return { user, tokens: { accessToken: signAccessToken(tokenPayload), refreshToken: signRefreshToken(tokenPayload), expiresIn: '7d' } }; };
export class DefaultAuthService implements AuthService {
  public constructor(private readonly database: Database) {}
  public async register(input: RegisterInput) { const existingUser = await this.database.query<{ id: string }>('SELECT id FROM users WHERE email = $1 AND deleted_at IS NULL', [input.email]); if (existingUser.rowCount > 0) { throw new ConflictError('An account with this email already exists'); } const passwordHash = await hashPassword(input.password); const inserted = await this.database.query<UserWithPasswordRow>('INSERT INTO users (email, password_hash, first_name, last_name, phone) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, first_name, last_name, phone, role, is_active, password_hash, created_at, updated_at', [input.email, passwordHash, input.firstName, input.lastName, input.phone ?? null]); return buildAuthResponse(inserted.rows[0]); }
  public async login(input: LoginInput) { const result = await this.database.query<UserWithPasswordRow>('SELECT id, email, first_name, last_name, phone, role, is_active, password_hash, created_at, updated_at FROM users WHERE email = $1 AND deleted_at IS NULL', [input.email]); if (result.rowCount === 0) { throw new AuthenticationError('Invalid email or password'); } const user = result.rows[0]; const passwordMatches = await comparePassword(input.password, user.password_hash); if (!passwordMatches || !user.is_active) { throw new AuthenticationError('Invalid email or password'); } return buildAuthResponse(user); }
  public async refreshToken(refreshToken: string) { const payload = verifyRefreshToken(refreshToken); const result = await this.database.query<UserWithPasswordRow>('SELECT id, email, first_name, last_name, phone, role, is_active, password_hash, created_at, updated_at FROM users WHERE id = $1 AND deleted_at IS NULL', [payload.id]); if (result.rowCount === 0 || !result.rows[0].is_active) { throw new NotFoundError('User associated with refresh token was not found'); } return buildAuthResponse(result.rows[0]); }
}
