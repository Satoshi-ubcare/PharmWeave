/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: ['src/domain/**/*.ts', '!src/domain/__tests__/**'],
  coverageThreshold: {
    global: { lines: 80 },
  },
}
