export type WorkflowStage =
  | 'reception'
  | 'prescription'
  | 'dispensing'
  | 'review'
  | 'payment'
  | 'claim'
  | 'completed'

export type InsuranceType =
  | 'health_insurance'
  | 'medical_aid_1'
  | 'medical_aid_2'
  | 'veterans'
  | 'industrial_accident'
  | 'auto_insurance'
  | 'self_pay'

export type CopayExemption =
  | 'none'
  | 'elderly'
  | 'disabled'
  | 'rare_disease'
  | 'pregnant'
  | 'infant'

export const INSURANCE_TYPE_LABELS: Record<InsuranceType, string> = {
  health_insurance: '건강보험',
  medical_aid_1: '의료급여 1종',
  medical_aid_2: '의료급여 2종',
  veterans: '보훈',
  industrial_accident: '산재보험',
  auto_insurance: '자동차보험',
  self_pay: '비급여',
}

export const COPAY_EXEMPTION_LABELS: Record<CopayExemption, string> = {
  none: '해당 없음',
  elderly: '노인 (65세 이상)',
  disabled: '장애인',
  rare_disease: '희귀·중증난치질환',
  pregnant: '임산부',
  infant: '영유아 (만 1세 미만)',
}

export interface Patient {
  id: string
  name: string
  birth_date: string
  phone: string | null
  gender: string | null
  allergies: string | null
  insurance_type: InsuranceType
  copay_exemption: CopayExemption
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

export interface Clinic {
  id: string
  name: string
  phone: string | null
  address: string | null
  created_at: string
  updated_at: string
}

export interface DashboardStats {
  totalVisits: number
  activeVisits: number
  completedVisits: number
  totalRevenue: number
  byStage: Partial<Record<WorkflowStage, number>>
  recentVisits: Array<{
    id: string
    patient: { name: string; birth_date: string }
    workflow_stage: WorkflowStage
    visited_at: string
    copay_amount: number | null
  }>
}
