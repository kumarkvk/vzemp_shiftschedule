module.exports = {
  testMatch: ['**/*.e2e.ts'],
  testTimeout: 180000,
  maxWorkers: 1,
  reporters: ['detox/runners/jest/reporter'],
  testRunner: 'jest-circus/runner',
  setupFilesAfterEnv: ['detox/runners/jest/adapter'],
};
