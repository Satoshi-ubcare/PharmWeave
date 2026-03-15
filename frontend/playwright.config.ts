import { defineConfig, devices } from '@playwright/test'

/**
 * E2E 테스트 설정
 *
 * 로컬 실행:
 *   npx playwright install chromium  # 최초 1회
 *   npm run test:e2e --workspace=frontend
 *
 * 프로덕션 대상:
 *   BASE_URL=https://pharm-weave-frontend.vercel.app npm run test:e2e --workspace=frontend
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'html',
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
