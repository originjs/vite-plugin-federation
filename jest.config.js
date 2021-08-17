/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

module.exports = {
  preset: 'ts-jest',
  testMatch: ['<rootDir>/packages/lib/**/*spec.[jt]s?(x)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  clearMocks: true
}
