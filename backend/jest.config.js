/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'src/domain/**/*.ts',
    'src/services/**/*.ts',
    'src/routes/**/*.ts',
    '!src/domain/__tests__/**',
    '!src/**/*.d.ts',
  ],
  coverageThreshold: {
    global: { lines: 80 },
  },
  testEnvironmentOptions: {
    env: { NODE_ENV: 'test' },
  },
}
