/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

module.exports = {
  preset: 'ts-jest',
  testMatch: ['<rootDir>/packages/examples/**/*spec.[jt]s?(x)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  clearMocks: true,
  testTimeout: 30000,
  globalSetup: './scripts/jestGlobalSetup.js',
  globalTeardown: './scripts/jestGlobalTeardown.js',
  testEnvironment: './scripts/jestEnv.js',
  setupFilesAfterEnv: ['./scripts/jestPerTestSetup.ts'],
  watchPathIgnorePatterns: ['<rootDir>/temp'],
  moduleNameMapper: {
    testUtils: '<rootDir>/packages/examples/testUtils.ts'
  },
  globals: {
    'ts-jest': {
      tsconfig: './packages/examples/tsconfig.json'
    }
  }
}
