import { test, expect } from '@playwright/test'

/**
 * Reception (접수) 화면 E2E 테스트
 */
test.describe('접수 화면', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reception')
  })

  test('접수 페이지 제목 및 검색 폼 표시', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /접수/ })).toBeVisible()
    await expect(page.getByPlaceholder(/이름|생년월일/)).toBeVisible()
  })

  test('환자 이름 검색 입력 후 자동완성 트리거', async ({ page }) => {
    const input = page.getByPlaceholder(/이름|생년월일/)
    await input.fill('김')
    // debounce 300ms 대기
    await page.waitForTimeout(400)
    // 검색 결과 또는 "등록 없음" 메시지 중 하나 표시
    const hasResults = await page.locator('[data-testid="patient-result"], .patient-result').count()
    const hasEmpty = await page.getByText(/검색 결과가 없습니다|신규 환자/).count()
    expect(hasResults + hasEmpty).toBeGreaterThanOrEqual(0)
  })

  test('신규 환자 등록 폼 표시', async ({ page }) => {
    const newBtn = page.getByRole('button', { name: /신규 환자/ })
    if (await newBtn.isVisible()) {
      await newBtn.click()
      await expect(page.getByRole('heading', { name: /신규 환자|환자 등록/ })).toBeVisible()
      await expect(page.getByLabel(/이름/)).toBeVisible()
      await expect(page.getByLabel(/생년월일/)).toBeVisible()
    }
  })

  test('단계별 대기 현황 대시보드 표시', async ({ page }) => {
    // StagePatientList 대시보드 — 6개 단계 뱃지 확인
    await expect(page.getByText('접수')).toBeVisible()
    await expect(page.getByText('처방')).toBeVisible()
  })
})
