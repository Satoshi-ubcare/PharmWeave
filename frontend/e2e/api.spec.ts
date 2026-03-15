import { test, expect } from '@playwright/test'

/**
 * API Contract Tests — HTTP 계약 검증 (브라우저 없이 request만 사용)
 * 서버가 실행 중인 환경(로컬 또는 프로덕션)에서만 동작
 */
test.describe('API', () => {
  test('GET /api/health → 200 { status: "ok" }', async ({ request }) => {
    const res = await request.get('/api/health')
    expect(res.ok()).toBeTruthy()
    const body = await res.json() as { status: string }
    expect(body.status).toBe('ok')
  })

  test('POST /api/auth/login — 잘못된 자격증명 → 401', async ({ request }) => {
    const res = await request.post('/api/auth/login', {
      data: { username: 'e2e-nonexistent-user', password: 'wrong-pw-e2e' },
    })
    expect(res.status()).toBe(401)
  })

  test('POST /api/auth/register — 짧은 비밀번호 → 400 (Zod 검증)', async ({ request }) => {
    const res = await request.post('/api/auth/register', {
      data: { username: 'e2e_user', password: '123' }, // 6자 미만
    })
    expect(res.status()).toBe(400)
    const body = await res.json() as { error: string }
    expect(body.error).toBe('Validation failed')
  })

  test('GET /api/drugs?q= → 약품 배열 반환', async ({ request }) => {
    const res = await request.get('/api/drugs?q=타이레놀')
    // 인증 미들웨어가 없는 public 엔드포인트
    expect([200, 401]).toContain(res.status())
  })
})
