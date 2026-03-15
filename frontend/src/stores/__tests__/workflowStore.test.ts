import { describe, it, expect, beforeEach } from 'vitest'
import { useWorkflowStore } from '../workflowStore'
import type { Visit, Patient } from '@/types'

const mockPatient: Patient = {
  id: 'p-1',
  name: '홍길동',
  birth_date: '1990-01-01',
  phone: '01012345678',
  created_at: '2026-03-16T00:00:00.000Z',
}

const mockVisit: Visit = {
  id: 'v-1',
  patient_id: 'p-1',
  workflow_stage: 'prescription',
  visited_at: '2026-03-16T09:00:00.000Z',
  created_at: '2026-03-16T09:00:00.000Z',
  updated_at: '2026-03-16T09:00:00.000Z',
  patient: mockPatient,
}

beforeEach(() => {
  useWorkflowStore.setState({
    visitId: null,
    currentStage: 'reception',
    patient: null,
    visit: null,
  })
})

describe('workflowStore', () => {
  describe('setVisit', () => {
    it('visitId, currentStage, visit, patient를 설정한다', () => {
      useWorkflowStore.getState().setVisit(mockVisit, mockPatient)

      const state = useWorkflowStore.getState()
      expect(state.visitId).toBe('v-1')
      expect(state.currentStage).toBe('prescription')
      expect(state.patient?.name).toBe('홍길동')
      expect(state.visit?.id).toBe('v-1')
    })
  })

  describe('setStage', () => {
    it('currentStage를 업데이트한다', () => {
      useWorkflowStore.getState().setVisit(mockVisit, mockPatient)
      useWorkflowStore.getState().setStage('dispensing')

      expect(useWorkflowStore.getState().currentStage).toBe('dispensing')
    })

    it('visit.workflow_stage도 함께 업데이트한다', () => {
      useWorkflowStore.getState().setVisit(mockVisit, mockPatient)
      useWorkflowStore.getState().setStage('review')

      expect(useWorkflowStore.getState().visit?.workflow_stage).toBe('review')
    })

    it('visit이 null이면 visit을 null로 유지한다', () => {
      useWorkflowStore.getState().setStage('dispensing')

      expect(useWorkflowStore.getState().visit).toBeNull()
    })
  })

  describe('reset', () => {
    it('모든 상태를 초기값으로 되돌린다', () => {
      useWorkflowStore.getState().setVisit(mockVisit, mockPatient)
      useWorkflowStore.getState().reset()

      const state = useWorkflowStore.getState()
      expect(state.visitId).toBeNull()
      expect(state.currentStage).toBe('reception')
      expect(state.patient).toBeNull()
      expect(state.visit).toBeNull()
    })
  })
})
