export type WorkflowStage =
  | 'reception'
  | 'prescription'
  | 'dispensing'
  | 'review'
  | 'payment'
  | 'claim'
  | 'completed'

export interface Patient {
  id: string
  name: string
  birth_date: string
  phone: string | null
  created_at: string
}

export interface Visit {
  id: string
  patient_id: string
  workflow_stage: WorkflowStage
  visited_at: string
  created_at: string
  updated_at: string
  patient?: Patient
}

export interface Drug {
  id: string
  drug_code: string
  drug_name: string
  unit_price: number
}

export interface PrescriptionItem {
  id: string
  drug_code: string
  drug_name: string
  unit_price: number
  quantity: number
  days: number
}

export interface Prescription {
  id: string
  visit_id: string
  clinic_name: string
  doctor_name: string | null
  prescribed_at: string
  items: PrescriptionItem[]
  created_at: string
  updated_at: string
}

export interface PrescriptionPayload {
  clinic_name: string
  doctor_name?: string
  prescribed_at: string
  items: {
    drug_code: string
    drug_name: string
    unit_price: number
    quantity: number
    days: number
  }[]
}

export interface Payment {
  id: string
  visit_id: string
  total_drug_cost: number
  copay_amount: number
  insurance_coverage: number
  payment_method: string
  paid_at: string
}

export interface Claim {
  id: string
  visit_id: string
  claim_data: Record<string, unknown>
  claim_status: 'pending' | 'submitted' | 'approved' | 'rejected'
  created_at: string
}

export interface Plugin {
  id: string
  name: string
  description: string
  enabled: boolean
}
