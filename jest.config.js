/*
 * @author Wayne
 * @Date 2025-07-27 14:38:44
 * @LastEditTime 2025-07-27 19:59:06
 */
// document: https://jestjs.io/docs/configuration

module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__', '<rootDir>/src'],
  testRegex: '/__tests__/(.+)\\.test\\.(jsx?|tsx?)$',
  transform: {
    '\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.test.json',
      },
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/types/(.*)$': '<rootDir>/src/types/$1',
    '^@/utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@/config/(.*)$': '<rootDir>/src/config/$1',
    '^@/core/(.*)$': '<rootDir>/src/core/$1',
    '^@/builders/(.*)$': '<rootDir>/src/builders/$1',
    '^@/processors/(.*)$': '<rootDir>/src/processors/$1',
  },
  collectCoverage: true,
  coverageDirectory: '<rootDir>/coverage',
  collectCoverageFrom: ['src/**/*.{ts,tsx}'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
