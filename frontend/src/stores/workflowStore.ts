/**
 * [전역 상태 — Zustand]
 * 페이지 이동에 관계없이 유지되어야 하는 워크플로우 진행 상태.
 * - visitId / currentStage / patient: 6단계 전체에서 공유
 *
 * [로컬 상태 — 훅]
 * API 요청의 loading / error / data 는 각 훅(useVisit, usePatient 등)이 관리.
 * 컴포넌트 언마운트 시 자동 폐기되므로 Zustand에 두지 않는다.
 */
import { create } from 'zustand'
import type { WorkflowStage, Visit, Patient } from '@/types'

interface WorkflowState {
  visitId: string | null
  currentStage: WorkflowStage
  patient: Patient | null
  visit: Visit | null
  setVisit: (visit: Visit, patient: Patient) => void
  setStage: (stage: WorkflowStage) => void
  reset: () => void
}

export const useWorkflowStore = create<WorkflowState>((set) => ({
  visitId: null,
  currentStage: 'reception',
  patient: null,
  visit: null,

  setVisit: (visit, patient) =>
    set({
      visitId: visit.id,
      currentStage: visit.workflow_stage,
      visit,
      patient,
    }),

  setStage: (stage) =>
    set((state) => ({
      currentStage: stage,
      visit: state.visit ? { ...state.visit, workflow_stage: stage } : null,
    })),

  reset: () =>
    set({
      visitId: null,
      currentStage: 'reception',
      patient: null,
      visit: null,
    }),
}))
