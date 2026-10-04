import fs from 'node:fs';
import path from 'node:path';

import dotenv from 'dotenv';

type NodeEnvironment = 'development' | 'test' | 'production';

const envName = (process.env.NODE_ENV ?? 'development') as NodeEnvironment;
const envFiles = [
  `.env.${envName}.local`,
  `.env.${envName}`,
  '.env.local',
  '.env',
  '../../.env'
].map((relativePath) => path.resolve(process.cwd(), relativePath));

for (const filePath of envFiles) {
  if (fs.existsSync(filePath)) {
    dotenv.config({ path: filePath, override: false });
  }
}

const readString = (key: string, fallback?: string): string => {
  const value = process.env[key] ?? fallback;
  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

const readOptionalString = (key: string): string | undefined => {
  const value = process.env[key];
  return value === undefined || value === '' ? undefined : value;
};

const readNumber = (key: string, fallback: number): number => {
  const value = process.env[key];
  if (value === undefined || value === '') {
    return fallback;
  }

  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    throw new Error(`Environment variable ${key} must be a number`);
  }

  return parsed;
};

const readBoolean = (key: string, fallback: boolean): boolean => {
  const value = process.env[key];
  if (value === undefined || value === '') {
    return fallback;
  }

  return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
};

const readStringList = (key: string, fallback: string[] = []): string[] => {
  const value = process.env[key];
  if (!value) {
    return fallback;
  }

  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
};

export const config = {
  nodeEnv: envName,
  isProduction: envName === 'production',
  isTest: envName === 'test',
  port: readNumber('PORT', 3000),
  trustProxy: readBoolean('TRUST_PROXY', false),
  corsOrigins: readStringList('API_CORS_ORIGIN', ['http://localhost:5173', 'http://localhost:5174']),
  logLevel: readString('LOG_LEVEL', envName === 'production' ? 'info' : 'debug'),
  logFile: readOptionalString('LOG_FILE'),
  database: {
    url: process.env.DB_URL ?? '',
    testUrl: process.env.DB_TEST_URL ?? '',
    host: readString('DB_HOST', 'localhost'),
    port: readNumber('DB_PORT', 5432),
    user: readString('DB_USER', 'postgres'),
    password: readString('DB_PASSWORD', 'postgres'),
    database: readString('DB_NAME', 'ecommerce'),
    testDatabase: readString('DB_TEST_NAME', 'ecommerce_test'),
    poolMin: readNumber('DB_POOL_MIN', 2),
    poolMax: readNumber('DB_POOL_MAX', 20),
    idleTimeoutMillis: readNumber('DB_POOL_IDLE_TIMEOUT', 30000),
    connectionTimeoutMillis: readNumber('DB_POOL_CONNECTION_TIMEOUT', 2000),
    statementTimeoutMillis: readNumber('DB_STATEMENT_TIMEOUT', 10000),
    ssl: readBoolean('DB_SSL', envName === 'production'),
    sslRejectUnauthorized: readBoolean('DB_SSL_REJECT_UNAUTHORIZED', true),
    enableQueryLogging: readBoolean('DB_ENABLE_QUERY_LOGGING', false)
  },
  auth: {
    jwtSecret: readString('JWT_SECRET', 'replace-with-a-long-random-secret'),
    jwtExpiry: readString('JWT_EXPIRY', '7d'),
    jwtRefreshSecret: readString('JWT_REFRESH_SECRET', 'replace-with-a-long-random-refresh-secret'),
    jwtRefreshExpiry: readString('JWT_REFRESH_EXPIRY', '30d'),
    bcryptSaltRounds: readNumber('BCRYPT_SALT_ROUNDS', 12)
  },
  stripe: {
    secretKey: readString('STRIPE_SECRET_KEY', 'sk_test_dummy'),
    publishableKey: readString('STRIPE_PUBLISHABLE_KEY', 'pk_test_dummy'),
    webhookSecret: readString('STRIPE_WEBHOOK_SECRET', 'whsec_dummy'),
    currency: readString('STRIPE_CURRENCY', 'usd')
  },
  testing: {
    runDatabaseTests: readBoolean('RUN_DATABASE_TESTS', false),
    autoSeedDatabase: readBoolean('DB_TEST_AUTO_SEED', true)
  }
} as const;

export type AppConfig = typeof config;
