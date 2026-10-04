import { performance } from 'node:perf_hooks';

import { Client, Pool } from 'pg';
import type { PoolConfig } from 'pg';

import type { Database, DatabaseHealth, PoolSnapshot, QueryResult, Queryable } from '../types/database';
import { config } from './env';
import { logger } from './logger';

const getTargetDatabaseName = (environment: 'development' | 'test' | 'production' = config.nodeEnv): string =>
  environment === 'test' ? config.database.testDatabase : config.database.database;

const getExplicitConnectionString = (environment: 'development' | 'test' | 'production' = config.nodeEnv): string =>
  environment === 'test' ? config.database.testUrl || config.database.url : config.database.url;

export const buildConnectionString = (
  databaseName: string = getTargetDatabaseName(),
  environment: 'development' | 'test' | 'production' = config.nodeEnv
): string => {
  const explicitConnectionString = getExplicitConnectionString(environment);
  if (explicitConnectionString) {
    const url = new URL(explicitConnectionString);
    url.pathname = `/${databaseName}`;
    return url.toString();
  }

  const user = encodeURIComponent(config.database.user);
  const password = encodeURIComponent(config.database.password);
  return `postgresql://${user}:${password}@${config.database.host}:${config.database.port}/${databaseName}`;
};

export const buildPoolConfig = (
  environment: 'development' | 'test' | 'production' = config.nodeEnv
): PoolConfig => ({
  connectionString: buildConnectionString(getTargetDatabaseName(environment), environment),
  min: config.database.poolMin,
  max: config.database.poolMax,
  idleTimeoutMillis: config.database.idleTimeoutMillis,
  connectionTimeoutMillis: config.database.connectionTimeoutMillis,
  statement_timeout: config.database.statementTimeoutMillis,
  ssl: config.database.ssl ? { rejectUnauthorized: config.database.sslRejectUnauthorized } : false,
  allowExitOnIdle: environment === 'test'
});

class PgDatabase implements Database {
  private readonly pool: Pool;

  public constructor(private readonly environment: 'development' | 'test' | 'production' = config.nodeEnv) {
    this.pool = new Pool(buildPoolConfig(environment));

    this.pool.on('connect', () => {
      logger.debug('PostgreSQL client connected', this.getPoolSnapshot());
    });

    this.pool.on('acquire', () => {
      logger.debug('PostgreSQL client acquired', this.getPoolSnapshot());
    });

    this.pool.on('remove', () => {
      logger.debug('PostgreSQL client removed', this.getPoolSnapshot());
    });

    this.pool.on('error', (error) => {
      logger.error('Unexpected PostgreSQL pool error', { error: error.message, stack: error.stack });
    });
  }

  public async query<T>(text: string, params: unknown[] = []): Promise<QueryResult<T>> {
    const startedAt = performance.now();
    const result = await this.pool.query(text, params);

    if (config.database.enableQueryLogging) {
      logger.debug('Executed query', {
        text,
        params,
        durationMs: Number((performance.now() - startedAt).toFixed(2))
      });
    }

    return { rows: result.rows as T[], rowCount: result.rowCount ?? 0 };
  }

  public async transaction<T>(callback: (client: Queryable) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');
      const queryable: Queryable = {
        query: async <TRow>(text: string, params: unknown[] = []): Promise<QueryResult<TRow>> => {
          const result = await client.query(text, params);
          return { rows: result.rows as TRow[], rowCount: result.rowCount ?? 0 };
        }
      };

      const response = await callback(queryable);
      await client.query('COMMIT');
      return response;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  public async validateConnection(): Promise<DatabaseHealth> {
    const startedAt = performance.now();
    const result = await this.pool.query<{ database: string }>('SELECT current_database() AS database');

    return {
      healthy: true,
      database: result.rows[0]?.database ?? getTargetDatabaseName(this.environment),
      latencyMs: Number((performance.now() - startedAt).toFixed(2)),
      pool: this.getPoolSnapshot()
    };
  }

  public async healthCheck(): Promise<DatabaseHealth> {
    return this.validateConnection();
  }

  public getPoolSnapshot(): PoolSnapshot {
    return {
      totalCount: this.pool.totalCount,
      idleCount: this.pool.idleCount,
      waitingCount: this.pool.waitingCount,
      minConnections: config.database.poolMin,
      maxConnections: config.database.poolMax
    };
  }

  public async close(): Promise<void> {
    await this.pool.end();
  }
}

let database: Database | undefined;
let shutdownHooksRegistered = false;

export const getDatabase = (): Database => {
  if (!database) {
    database = new PgDatabase();
  }

  return database;
};

export const query = async <T>(text: string, params: unknown[] = []): Promise<QueryResult<T>> =>
  getDatabase().query<T>(text, params);

export const withTransaction = async <T>(callback: (client: Queryable) => Promise<T>): Promise<T> =>
  getDatabase().transaction(callback);

export const validateDatabaseConnection = async (): Promise<DatabaseHealth> => getDatabase().validateConnection();

export const closeDatabase = async (): Promise<void> => {
  if (!database) {
    return;
  }

  const activeDatabase = database;
  database = undefined;
  await activeDatabase.close();
};

export const registerDatabaseShutdownHandlers = (): void => {
  if (shutdownHooksRegistered) {
    return;
  }

  const shutdown = async (signal: NodeJS.Signals): Promise<void> => {
    logger.info(`Received ${signal}; closing database pool`);
    try {
      await closeDatabase();
    } finally {
      process.exit(0);
    }
  };

  for (const signal of ['SIGINT', 'SIGTERM'] as const) {
    process.once(signal, () => {
      void shutdown(signal);
    });
  }

  shutdownHooksRegistered = true;
};

export const ensureDatabaseExists = async (
  databaseName: string = getTargetDatabaseName('test'),
  environment: 'development' | 'test' | 'production' = 'test'
): Promise<void> => {
  const adminClient = new Client({
    ...buildPoolConfig(environment),
    connectionString: buildConnectionString('postgres', environment)
  });

  await adminClient.connect();

  try {
    const existingDatabase = await adminClient.query<{ datname: string }>('SELECT datname FROM pg_database WHERE datname = $1', [
      databaseName
    ]);

    if (existingDatabase.rowCount === 0) {
      await adminClient.query(`CREATE DATABASE "${databaseName.replace(/"/g, '""')}"`);
    }
  } finally {
    await adminClient.end();
  }
};
