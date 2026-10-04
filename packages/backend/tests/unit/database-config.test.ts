import { buildConnectionString, buildPoolConfig } from '../../src/config/database';
import { config } from '../../src/config/env';

describe('database configuration', () => {
  it('builds a connection string for the active database', () => {
    const connectionString = buildConnectionString('sample_db', 'development');

    expect(connectionString).toContain('@');
    expect(connectionString).toContain('/sample_db');
  });

  it('uses required production-ready pool settings', () => {
    const poolConfig = buildPoolConfig('development');

    expect(poolConfig.min).toBe(2);
    expect(poolConfig.max).toBe(20);
    expect(poolConfig.idleTimeoutMillis).toBe(30000);
    expect(poolConfig.connectionTimeoutMillis).toBe(2000);
    expect(poolConfig.statement_timeout).toBe(config.database.statementTimeoutMillis);
  });

  it('targets the dedicated test database in test mode', () => {
    const poolConfig = buildPoolConfig('test');

    expect(poolConfig.connectionString).toContain(`/${config.database.testDatabase}`);
    expect(poolConfig.allowExitOnIdle).toBe(true);
  });
});
