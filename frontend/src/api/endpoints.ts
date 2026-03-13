import apiClient from './client'
import type {
  Patient,
  Visit,
  WorkflowStage,
  Prescription,
  PrescriptionPayload,
  Drug,
  Payment,
  Claim,
  Plugin,
} from '@/types'

// ─── Auth ────────────────────────────────────────────────
export const authApi = {
  login: (username: string, password: string) =>
    apiClient.post<{ token: string }>('/auth/login', { username, password }),
  register: (username: string, password: string) =>
    apiClient.post<{ token: string }>('/auth/register', { username, password }),
}

// ─── Patients ────────────────────────────────────────────
export const patientApi = {
  search: (q: string) =>
    apiClient.get<Patient[]>('/patients', { params: { q } }),
  create: (data: { name: string; birth_date: string; phone?: string }) =>
    apiClient.post<Patient>('/patients', data),
  get: (id: string) =>
    apiClient.get<Patient>(`/patients/${id}`),
}

// ─── Visits ──────────────────────────────────────────────
export const visitApi = {
  create: (patientId: string) =>
    apiClient.post<Visit>('/visits', { patient_id: patientId }),
  today: () =>
    apiClient.get<Visit[]>('/visits/today'),
  get: (id: string) =>
    apiClient.get<Visit>(`/visits/${id}`),
  transitionStage: (id: string, stage: WorkflowStage) =>
    apiClient.patch<Visit>(`/visits/${id}/stage`, { stage }),
}

// ─── Prescriptions ───────────────────────────────────────
export const prescriptionApi = {
  create: (visitId: string, data: PrescriptionPayload) =>
    apiClient.post<Prescription>(`/visits/${visitId}/prescriptions`, data),
  get: (visitId: string) =>
    apiClient.get<Prescription>(`/visits/${visitId}/prescriptions`),
}

// ─── Drugs ───────────────────────────────────────────────
export const drugApi = {
  search: (q: string) =>
    apiClient.get<Drug[]>('/drugs', { params: { q } }),
}

// ─── Payment ─────────────────────────────────────────────
export const paymentApi = {
  create: (visitId: string, method: string) =>
    apiClient.post<Payment>(`/visits/${visitId}/payment`, { method }),
  get: (visitId: string) =>
    apiClient.get<Payment>(`/visits/${visitId}/payment`),
}

// ─── Claim ───────────────────────────────────────────────
export const claimApi = {
  create: (visitId: string) =>
    apiClient.post<Claim>(`/visits/${visitId}/claim`),
  get: (visitId: string) =>
    apiClient.get<Claim>(`/visits/${visitId}/claim`),
}

// ─── Plugins ─────────────────────────────────────────────
export const pluginApi = {
  list: () =>
    apiClient.get<Plugin[]>('/plugins'),
  toggle: (id: string, enabled: boolean) =>
    apiClient.patch<Plugin>(`/plugins/${id}`, { enabled }),
  execute: (id: string, visitId: string) =>
    apiClient.post(`/plugins/${id}/execute`, { visitId }),
}
