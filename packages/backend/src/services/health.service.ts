import type { Database } from '../types/database';
import type { HealthService } from '../types/services';
export class DefaultHealthService implements HealthService { public constructor(private readonly database: Database) {} public checkLiveness() { return { status: 'ok' as const, timestamp: new Date().toISOString() }; } public async checkReadiness() { await this.database.query('SELECT 1 AS ok'); return { status: 'ready' as const, database: 'ok' as const, timestamp: new Date().toISOString() }; } }
