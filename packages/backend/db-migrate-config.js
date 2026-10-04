const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const backendRoot = __dirname;
const runtimeEnv = process.env.NODE_ENV || 'development';
const envFiles = [
  `.env.${runtimeEnv}.local`,
  `.env.${runtimeEnv}`,
  '.env.local',
  '.env'
];

for (const relativePath of envFiles) {
  const fullPath = path.join(backendRoot, relativePath);
  if (fs.existsSync(fullPath)) {
    dotenv.config({ path: fullPath, override: false });
  }
}

const parseNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseBoolean = (value, fallback = false) => {
  if (typeof value !== 'string') {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();

  if (['true', '1', 'yes', 'on'].includes(normalized)) {
    return true;
  }

  if (['false', '0', 'no', 'off'].includes(normalized)) {
    return false;
  }

  return fallback;
};

const buildConfig = (database, connectionString) => ({
  driver: 'pg',
  ...(connectionString
    ? { connectionString }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: parseNumber(process.env.DB_PORT, 5432),
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database
      }),
  ssl: parseBoolean(process.env.DB_SSL, runtimeEnv === 'production')
});

const envMap = {
  development: 'dev',
  test: 'test',
  production: 'prod'
};

module.exports = {
  dev: buildConfig(process.env.DB_NAME || 'ecommerce', process.env.DB_URL),
  test: buildConfig(process.env.DB_TEST_NAME || 'ecommerce_test', process.env.DB_TEST_URL || process.env.DB_URL),
  prod: buildConfig(process.env.DB_NAME || 'ecommerce', process.env.DB_URL),
  defaultEnv: envMap[runtimeEnv] || 'dev'
};
