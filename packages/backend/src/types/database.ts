export interface QueryResult<T> {
  rows: T[];
  rowCount: number;
}

export interface Queryable {
  query<T>(text: string, params?: unknown[]): Promise<QueryResult<T>>;
}

export interface PoolSnapshot {
  totalCount: number;
  idleCount: number;
  waitingCount: number;
  minConnections: number;
  maxConnections: number;
}

export interface DatabaseHealth {
  healthy: boolean;
  database: string;
  latencyMs: number;
  pool: PoolSnapshot;
}

export interface Database extends Queryable {
  transaction<T>(callback: (client: Queryable) => Promise<T>): Promise<T>;
  validateConnection(): Promise<DatabaseHealth>;
  healthCheck(): Promise<DatabaseHealth>;
  getPoolSnapshot(): PoolSnapshot;
  close(): Promise<void>;
}
