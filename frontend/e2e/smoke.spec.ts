import { test, expect } from '@playwright/test'

/**
 * Smoke Tests — 페이지 로딩 및 핵심 UI 요소 확인
 * 로그인 없이 접근 가능한 공개 UI만 검증
 */
test.describe('Smoke', () => {
  test('루트 접속 시 /reception으로 리다이렉트', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/reception/)
  })

  test('헤더에 PharmWeave 브랜드 표시', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('PharmWeave')).toBeVisible()
    await expect(page.getByText('약국 PMS')).toBeVisible()
  })

  test('워크플로우 스테퍼 6단계 모두 표시', async ({ page }) => {
    await page.goto('/')
    for (const label of ['접수', '처방', '조제', '검토', '수납', '청구']) {
      await expect(page.getByText(label)).toBeVisible()
    }
  })

  test('다크 모드 토글 — html 클래스 전환', async ({ page }) => {
    await page.goto('/')
    const toggle = page.getByRole('button', { name: '테마 전환' })
    await expect(toggle).toBeVisible()

    // 라이트 → 다크
    await toggle.click()
    await expect(page.locator('html')).toHaveClass(/dark/)

    // 다크 → 라이트
    await toggle.click()
    await expect(page.locator('html')).not.toHaveClass(/dark/)
  })

  test('Plugin 관리 페이지 이동', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /Plugin/ }).click()
    await expect(page).toHaveURL(/\/plugins/)
    await expect(page.getByRole('heading', { name: /Plugin/ })).toBeVisible()
  })
})
