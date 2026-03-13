import { ClaimDataBuilder } from '../ClaimDataBuilder'

const BASE_INPUT = {
  visit_id: 'visit-uuid-001',
  patient_name: '김민준',
  birth_date: '1975-03-15',
  clinic_name: '서울내과의원',
  doctor_name: '이의사',
  prescribed_at: '2026-03-14',
  items: [
    { drug_code: '644900060', drug_name: '아목시실린캡슐500mg', unit_price: 180, quantity: 2, days: 3 },
  ],
  total_drug_cost: 1_080,
  copay_amount: 216,
  insurance_coverage: 864,
}

describe('ClaimDataBuilder', () => {
  const builder = new ClaimDataBuilder()

  it('올바른 입력으로 청구 데이터를 생성한다', () => {
    const result = builder.build(BASE_INPUT)
    expect(result.visit_id).toBe('visit-uuid-001')
    expect(result.patient_name).toBe('김민준')
    expect(result.items).toHaveLength(1)
    expect(result.items[0].total).toBe(1_080) // 180 * 2 * 3
    expect(result.claimed_at).toBeDefined()
  })

  it('items에 total 필드가 자동 계산된다', () => {
    const result = builder.build(BASE_INPUT)
    const item = result.items[0]
    expect(item.total).toBe(item.unit_price * item.quantity * item.days)
  })

  it('복수 처방 항목 모두 total이 계산된다', () => {
    const input = {
      ...BASE_INPUT,
      items: [
        { drug_code: 'A', drug_name: '약A', unit_price: 100, quantity: 2, days: 3 },
        { drug_code: 'B', drug_name: '약B', unit_price: 200, quantity: 1, days: 5 },
      ],
    }
    const result = builder.build(input)
    expect(result.items[0].total).toBe(600)
    expect(result.items[1].total).toBe(1_000)
  })

  it('visit_id가 없으면 예외를 던진다', () => {
    expect(() => builder.build({ ...BASE_INPUT, visit_id: '' })).toThrow('visit_id가 필요합니다.')
  })

  it('patient_name이 없으면 예외를 던진다', () => {
    expect(() => builder.build({ ...BASE_INPUT, patient_name: '' })).toThrow('환자명이 필요합니다.')
  })

  it('items가 비어있으면 예외를 던진다', () => {
    expect(() => builder.build({ ...BASE_INPUT, items: [] })).toThrow('처방 항목이 없습니다.')
  })
})
