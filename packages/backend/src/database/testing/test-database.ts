import { promisify } from 'node:util';
import { execFile } from 'node:child_process';

import { closeDatabase, ensureDatabaseExists } from '../../config/database';
import { config } from '../../config/env';

const execFileAsync = promisify(execFile);

const resolveLocalBinary = (name: string): string =>
  process.platform === 'win32'
    ? `${process.cwd()}\\node_modules\\.bin\\${name}.cmd`
    : `${process.cwd()}/node_modules/.bin/${name}`;

const runBinary = async (binaryName: string, args: string[]): Promise<void> => {
  await execFileAsync(resolveLocalBinary(binaryName), args, {
    cwd: process.cwd(),
    env: { ...process.env, NODE_ENV: 'test' }
  });
};

export const prepareTestDatabase = async (): Promise<void> => {
  await ensureDatabaseExists(config.database.testDatabase, 'test');
  await runBinary('db-migrate', ['up', '--config', './db-migrate-config.js', '--migrations-dir', './migrations']);

  if (config.testing.autoSeedDatabase) {
    await runBinary('tsx', ['src/scripts/seed.ts']);
  }
};

export const cleanupTestDatabase = async (): Promise<void> => {
  await closeDatabase();
};
