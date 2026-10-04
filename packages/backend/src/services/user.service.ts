import { NotFoundError } from '../errors/AppError';
import type { AdminUserListQuery, ProfileUpdateInput } from '../types/api';
import type { Database } from '../types/database';
import type { UserService } from '../types/services';
import { mapUser } from '../utils/mappers';
import { buildPagination } from '../utils/pagination';
interface UserRow { id: string; email: string; first_name: string; last_name: string; phone: string | null; role: 'user' | 'admin'; is_active: boolean; created_at: Date; updated_at: Date; }
export class DefaultUserService implements UserService {
  public constructor(private readonly database: Database) {}
  public async getProfile(userId: string) { return this.getUserById(userId); }
  public async updateProfile(userId: string, input: ProfileUpdateInput) { await this.getUserById(userId); const updates: string[] = []; const values: unknown[] = []; const fields: Array<[keyof ProfileUpdateInput, string]> = [['firstName', 'first_name'], ['lastName', 'last_name'], ['phone', 'phone']]; for (const [field, column] of fields) { const value = input[field]; if (value !== undefined) { values.push(value); updates.push(`${column} = $${values.length}`); } } if (updates.length === 0) { return this.getUserById(userId); } values.push(userId); const result = await this.database.query<UserRow>(`UPDATE users SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${values.length} AND deleted_at IS NULL RETURNING id, email, first_name, last_name, phone, role, is_active, created_at, updated_at`, values); return mapUser(result.rows[0]); }
  public async getUserById(userId: string) { const result = await this.database.query<UserRow>('SELECT id, email, first_name, last_name, phone, role, is_active, created_at, updated_at FROM users WHERE id = $1 AND deleted_at IS NULL', [userId]); if (result.rowCount === 0) { throw new NotFoundError('User not found'); } return mapUser(result.rows[0]); }
  public async listUsers(query: AdminUserListQuery) { const whereClauses = ['deleted_at IS NULL']; const values: unknown[] = []; if (query.role) { values.push(query.role); whereClauses.push(`role = $${values.length}`); } const countResult = await this.database.query<{ total: string }>(`SELECT COUNT(*) AS total FROM users WHERE ${whereClauses.join(' AND ')}`, values); const offset = (query.page - 1) * query.limit; values.push(query.limit, offset); const rows = await this.database.query<UserRow>(`SELECT id, email, first_name, last_name, phone, role, is_active, created_at, updated_at FROM users WHERE ${whereClauses.join(' AND ')} ORDER BY created_at DESC LIMIT $${values.length - 1} OFFSET $${values.length}`, values); return { items: rows.rows.map(mapUser), pagination: buildPagination(query.page, query.limit, Number(countResult.rows[0]?.total ?? 0)) }; }
}
