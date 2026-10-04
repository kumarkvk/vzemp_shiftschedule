import type { Database, DatabaseHealth, PoolSnapshot, QueryResult, Queryable } from '../../src/types/database';

type QueryMock = jest.Mock<Promise<QueryResult<any>>, [string, (unknown[] | undefined)?]>;

const defaultPoolSnapshot = (): PoolSnapshot => ({
  totalCount: 0,
  idleCount: 0,
  waitingCount: 0,
  minConnections: 0,
  maxConnections: 20,
});

const defaultHealth = (): DatabaseHealth => ({
  healthy: true,
  database: 'test',
  latencyMs: 1,
  pool: defaultPoolSnapshot(),
});

export interface MockDatabase extends Database {
  query: QueryMock;
  transaction: jest.Mock<Promise<any>, [(client: Queryable) => Promise<any>]>;
  validateConnection: jest.Mock<Promise<DatabaseHealth>, []>;
  healthCheck: jest.Mock<Promise<DatabaseHealth>, []>;
  getPoolSnapshot: jest.Mock<PoolSnapshot, []>;
  close: jest.Mock<Promise<void>, []>;
}

export const createMockDatabase = (): MockDatabase => {
  const query: QueryMock = jest.fn();

  const database: MockDatabase = {
    query,
    transaction: jest.fn(async (callback) => callback({ query })),
    validateConnection: jest.fn(async () => defaultHealth()),
    healthCheck: jest.fn(async () => defaultHealth()),
    getPoolSnapshot: jest.fn(() => defaultPoolSnapshot()),
    close: jest.fn(async () => undefined),
  };

  return database;
};
