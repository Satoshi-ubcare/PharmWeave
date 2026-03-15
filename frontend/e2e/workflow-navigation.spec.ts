import { test, expect } from '@playwright/test'

/**
 * Workflow 네비게이션 E2E 테스트
 * visitId 없이 각 단계 페이지에 직접 접근 시 안내 메시지 표시를 검증
 */
test.describe('Workflow 단계 페이지 — visitId 없는 상태', () => {
  const stages = [
    { path: '/prescription', heading: '처방' },
    { path: '/dispensing',   heading: '조제' },
    { path: '/review',       heading: '검토' },
    { path: '/payment',      heading: '수납' },
    { path: '/claim',        heading: '청구' },
  ] as const

  for (const { path, heading } of stages) {
    test(`${heading} 페이지 — 환자 미선택 안내 표시`, async ({ page }) => {
      await page.goto(path)
      // 각 페이지 h1 제목 확인 (h2 사이드바 헤딩과 구분)
      await expect(page.getByRole('heading', { level: 1, name: new RegExp(heading) })).toBeVisible()
      // visitId 없을 때 안내 문구 표시
      const guideMsg = page.getByText(/선택하세요|시작해주세요|대기 환자/)
      await expect(guideMsg.first()).toBeVisible()
    })
  }

  test('스테퍼에서 완료 단계 클릭 불가 (미방문 단계)', async ({ page }) => {
    await page.goto('/reception')
    // visitId 없을 때 처방 단계 버튼은 disabled
    const prescriptionBtn = page.getByRole('button', { name: '처방' })
    await expect(prescriptionBtn).toBeDisabled()
  })
})
