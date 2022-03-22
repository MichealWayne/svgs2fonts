// document: https://jestjs.io/docs/configuration

module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__'],
  testRegex: '/__tests__/(.+)\\.test\\.(jsx?|tsx?)$',
  transform: {
    '\\.(ts|tsx)$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverage: true,
  coverageDirectory: '<rootDir>/coverage',
  collectCoverageFrom: ['src/**/*.{ts,tsx}'],
};
