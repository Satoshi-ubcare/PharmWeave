import { CopayCalculator } from '../CopayCalculator'

describe('CopayCalculator', () => {
  const calc = new CopayCalculator()

  // ─── 건강보험 (기본) ─────────────────────────────────────
  describe('건강보험 / 경감 없음', () => {
    it('약제비가 10,000원 미만이면 20%', () => {
      const items = [{ unit_price: 100, quantity: 1, days: 3 }] // 300원
      const result = calc.calculate(items, 'health_insurance', 'none')
      expect(result.totalDrugCost).toBe(300)
      expect(result.copayAmount).toBe(60)
      expect(result.insuranceCoverage).toBe(240)
    })

    it('약제비가 10,000원 이상이면 30%', () => {
      const items = [{ unit_price: 500, quantity: 10, days: 3 }] // 15,000원
      const result = calc.calculate(items, 'health_insurance', 'none')
      expect(result.totalDrugCost).toBe(15_000)
      expect(result.copayAmount).toBe(4_500)
      expect(result.insuranceCoverage).toBe(10_500)
    })

    it('약제비가 정확히 10,000원이면 30%', () => {
      const result = calc.calculate(
        [{ unit_price: 1_000, quantity: 10, days: 1 }],
        'health_insurance', 'none',
      )
      expect(result.copayAmount).toBe(3_000)
    })

    it('기본값(인수 생략)도 동일하게 계산한다', () => {
      const items = [{ unit_price: 500, quantity: 10, days: 3 }]
      expect(calc.calculate(items).copayAmount).toBe(4_500)
    })
  })

  // ─── 건강보험 / 노인 ─────────────────────────────────────
  describe('건강보험 / 노인 경감', () => {
    it('약제비 10,000원 미만 → 무료', () => {
      const result = calc.calculate(
        [{ unit_price: 300, quantity: 1, days: 3 }], // 900원
        'health_insurance', 'elderly',
      )
      expect(result.copayAmount).toBe(0)
    })

    it('약제비 10,000원 이상 15,000원 미만 → 1,500원 정액', () => {
      const result = calc.calculate(
        [{ unit_price: 400, quantity: 10, days: 3 }], // 12,000원
        'health_insurance', 'elderly',
      )
      expect(result.copayAmount).toBe(1_500)
    })

    it('약제비 15,000원 이상 → 10%', () => {
      const result = calc.calculate(
        [{ unit_price: 500, quantity: 10, days: 4 }], // 20,000원
        'health_insurance', 'elderly',
      )
      expect(result.copayAmount).toBe(2_000)
    })
  })

  // ─── 건강보험 / 기타 경감 ────────────────────────────────
  describe('건강보험 / 기타 경감', () => {
    it('영유아 → 무료', () => {
      const result = calc.calculate(
        [{ unit_price: 1_000, quantity: 5, days: 3 }],
        'health_insurance', 'infant',
      )
      expect(result.copayAmount).toBe(0)
    })

    it('장애인 → 20% 고정', () => {
      const result = calc.calculate(
        [{ unit_price: 1_000, quantity: 5, days: 3 }], // 15,000원
        'health_insurance', 'disabled',
      )
      expect(result.copayAmount).toBe(3_000)
    })

    it('임산부 → 20% 고정', () => {
      const result = calc.calculate(
        [{ unit_price: 1_000, quantity: 5, days: 3 }],
        'health_insurance', 'pregnant',
      )
      expect(result.copayAmount).toBe(3_000)
    })

    it('희귀질환 산정특례 → 10%', () => {
      const result = calc.calculate(
        [{ unit_price: 1_000, quantity: 5, days: 3 }], // 15,000원
        'health_insurance', 'rare_disease',
      )
      expect(result.copayAmount).toBe(1_500)
    })
  })

  // ─── 의료급여 ────────────────────────────────────────────
  describe('의료급여', () => {
    it('의료급여 1종 → 500원 정액', () => {
      const result = calc.calculate(
        [{ unit_price: 1_000, quantity: 5, days: 3 }],
        'medical_aid_1',
      )
      expect(result.copayAmount).toBe(500)
    })

    it('의료급여 1종 — 약제비가 500원 미만이면 전액', () => {
      const result = calc.calculate(
        [{ unit_price: 100, quantity: 1, days: 3 }], // 300원
        'medical_aid_1',
      )
      expect(result.copayAmount).toBe(300)
    })

    it('의료급여 2종 → 15%', () => {
      const result = calc.calculate(
        [{ unit_price: 1_000, quantity: 10, days: 1 }], // 10,000원
        'medical_aid_2',
      )
      expect(result.copayAmount).toBe(1_500)
    })
  })

  // ─── 공단 전액 부담 유형 ──────────────────────────────────
  describe('공단/보험사 전액 부담', () => {
    it('보훈 → 0원', () => {
      const result = calc.calculate(
        [{ unit_price: 1_000, quantity: 5, days: 3 }],
        'veterans',
      )
      expect(result.copayAmount).toBe(0)
      expect(result.insuranceCoverage).toBe(15_000)
    })

    it('산재보험 → 0원', () => {
      const result = calc.calculate(
        [{ unit_price: 500, quantity: 10, days: 3 }],
        'industrial_accident',
      )
      expect(result.copayAmount).toBe(0)
    })

    it('자동차보험 → 0원', () => {
      const result = calc.calculate(
        [{ unit_price: 500, quantity: 10, days: 3 }],
        'auto_insurance',
      )
      expect(result.copayAmount).toBe(0)
    })
  })

  // ─── 비급여 ──────────────────────────────────────────────
  describe('비급여', () => {
    it('비급여 → 100% 전액 본인 부담', () => {
      const result = calc.calculate(
        [{ unit_price: 1_000, quantity: 5, days: 3 }], // 15,000원
        'self_pay',
      )
      expect(result.copayAmount).toBe(15_000)
      expect(result.insuranceCoverage).toBe(0)
    })
  })

  // ─── 공통 ────────────────────────────────────────────────
  describe('공통', () => {
    it('복수 항목 합계를 계산한다', () => {
      const items = [
        { unit_price: 100, quantity: 2, days: 3 }, // 600
        { unit_price: 200, quantity: 1, days: 5 }, // 1,000
      ]
      const result = calc.calculate(items)
      expect(result.totalDrugCost).toBe(1_600)
      expect(result.copayAmount).toBe(320) // 20%
    })

    it('처방 항목이 없으면 예외를 던진다', () => {
      expect(() => calc.calculate([])).toThrow('처방 항목이 없습니다.')
    })

    it('totalDrugCost = copayAmount + insuranceCoverage 항등식', () => {
      const items = [{ unit_price: 175, quantity: 3, days: 7 }]
      const result = calc.calculate(items)
      expect(result.copayAmount + result.insuranceCoverage).toBe(result.totalDrugCost)
    })
  })
})
