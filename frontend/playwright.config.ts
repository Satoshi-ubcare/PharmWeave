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
 *
 * CI 스테이징 대상 (Vercel Preview):
 *   BASE_URL=<preview-url> VERCEL_BYPASS_TOKEN=<secret> npm run test:e2e --workspace=frontend
 *   → VERCEL_BYPASS_TOKEN이 있으면 x-vercel-protection-bypass 헤더를 모든 요청에 자동 추가
 *     (Vercel Deployment Protection 우회 — CI 자동화 전용)
 */

// Vercel Preview 배포 보호 우회 헤더 (CI에서만 사용)
const bypassHeaders = process.env.VERCEL_BYPASS_TOKEN
  ? { 'x-vercel-protection-bypass': process.env.VERCEL_BYPASS_TOKEN }
  : {}

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
    extraHTTPHeaders: bypassHeaders,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
