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
