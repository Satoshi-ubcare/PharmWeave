export interface ClaimItem {
  drug_code: string
  drug_name: string
  unit_price: number
  quantity: number
  days: number
  total: number
}

export interface ClaimData {
  visit_id: string
  patient_name: string
  birth_date: string
  clinic_name: string
  doctor_name: string | null
  prescribed_at: string
  items: ClaimItem[]
  total_drug_cost: number
  copay_amount: number
  insurance_coverage: number
  claimed_at: string
}

export interface ClaimBuildInput {
  visit_id: string
  patient_name: string
  birth_date: string
  clinic_name: string
  doctor_name: string | null
  prescribed_at: string
  items: {
    drug_code: string
    drug_name: string
    unit_price: number
    quantity: number
    days: number
  }[]
  total_drug_cost: number
  copay_amount: number
  insurance_coverage: number
}

export class ClaimDataBuilder {
  build(input: ClaimBuildInput): ClaimData {
    if (!input.visit_id) throw new Error('visit_id가 필요합니다.')
    if (!input.patient_name) throw new Error('환자명이 필요합니다.')
    if (input.items.length === 0) throw new Error('처방 항목이 없습니다.')

    return {
      ...input,
      items: input.items.map((item) => ({
        ...item,
        total: item.unit_price * item.quantity * item.days,
      })),
      claimed_at: new Date().toISOString(),
    }
  }
}
