import { CopayCalculator } from '../CopayCalculator'

describe('CopayCalculator', () => {
  const calc = new CopayCalculator()

  it('약제비가 10,000원 미만이면 20% 본인부담금을 계산한다', () => {
    const items = [{ unit_price: 100, quantity: 1, days: 3 }] // 300원
    const result = calc.calculate(items)
    expect(result.totalDrugCost).toBe(300)
    expect(result.copayAmount).toBe(60) // 300 * 20%
    expect(result.insuranceCoverage).toBe(240)
  })

  it('약제비가 10,000원 이상이면 30% 본인부담금을 계산한다', () => {
    const items = [{ unit_price: 500, quantity: 10, days: 3 }] // 15,000원
    const result = calc.calculate(items)
    expect(result.totalDrugCost).toBe(15_000)
    expect(result.copayAmount).toBe(4_500) // 15,000 * 30%
    expect(result.insuranceCoverage).toBe(10_500)
  })

  it('약제비가 정확히 10,000원이면 30% 본인부담금을 계산한다', () => {
    const items = [{ unit_price: 1_000, quantity: 10, days: 1 }] // 10,000원
    const result = calc.calculate(items)
    expect(result.copayAmount).toBe(3_000) // 30%
  })

  it('복수 처방 항목의 합계를 계산한다', () => {
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

  it('totalDrugCost = copayAmount + insuranceCoverage 가 항상 성립한다', () => {
    const items = [{ unit_price: 175, quantity: 3, days: 7 }]
    const result = calc.calculate(items)
    expect(result.copayAmount + result.insuranceCoverage).toBe(result.totalDrugCost)
  })
})
