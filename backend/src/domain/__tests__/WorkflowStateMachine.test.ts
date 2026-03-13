import { WorkflowStateMachine, InvalidTransitionError } from '../WorkflowStateMachine'

describe('WorkflowStateMachine', () => {
  describe('canTransition', () => {
    it('유효한 다음 단계로의 전환은 true를 반환한다', () => {
      const sm = new WorkflowStateMachine('reception')
      expect(sm.canTransition('prescription')).toBe(true)
    })

    it('잘못된 단계로의 전환은 false를 반환한다', () => {
      const sm = new WorkflowStateMachine('reception')
      expect(sm.canTransition('dispensing')).toBe(false)
    })

    it('동일 단계로의 전환은 false를 반환한다', () => {
      const sm = new WorkflowStateMachine('reception')
      expect(sm.canTransition('reception')).toBe(false)
    })
  })

  describe('transition', () => {
    it('reception → prescription 전환이 성공한다', () => {
      const sm = new WorkflowStateMachine('reception')
      sm.transition('prescription')
      expect(sm.currentStage).toBe('prescription')
    })

    it('전체 워크플로우 순방향 전환이 성공한다', () => {
      const sm = new WorkflowStateMachine('reception')
      const stages = ['prescription', 'dispensing', 'review', 'payment', 'claim', 'completed'] as const
      for (const stage of stages) {
        sm.transition(stage)
        expect(sm.currentStage).toBe(stage)
      }
    })

    it('단계를 건너뛰면 InvalidTransitionError를 던진다', () => {
      const sm = new WorkflowStateMachine('reception')
      expect(() => sm.transition('dispensing')).toThrow(InvalidTransitionError)
    })

    it('역방향 전환은 InvalidTransitionError를 던진다', () => {
      const sm = new WorkflowStateMachine('prescription')
      expect(() => sm.transition('reception')).toThrow(InvalidTransitionError)
    })

    it('completed 상태에서 추가 전환은 InvalidTransitionError를 던진다', () => {
      const sm = new WorkflowStateMachine('completed')
      expect(() => sm.transition('claim')).toThrow(InvalidTransitionError)
    })
  })

  describe('isValidStage', () => {
    it('유효한 stage 문자열은 true를 반환한다', () => {
      expect(WorkflowStateMachine.isValidStage('reception')).toBe(true)
      expect(WorkflowStateMachine.isValidStage('completed')).toBe(true)
    })

    it('유효하지 않은 문자열은 false를 반환한다', () => {
      expect(WorkflowStateMachine.isValidStage('unknown')).toBe(false)
      expect(WorkflowStateMachine.isValidStage('')).toBe(false)
    })
  })
})
