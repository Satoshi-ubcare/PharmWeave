export type WorkflowStage =
  | 'reception'
  | 'prescription'
  | 'dispensing'
  | 'review'
  | 'payment'
  | 'claim'
  | 'completed'

const VALID_TRANSITIONS: Record<WorkflowStage, WorkflowStage> = {
  reception: 'prescription',
  prescription: 'dispensing',
  dispensing: 'review',
  review: 'payment',
  payment: 'claim',
  claim: 'completed',
  completed: 'completed',
}

export class InvalidTransitionError extends Error {
  constructor(from: WorkflowStage, to: WorkflowStage) {
    super(`Invalid transition: ${from} → ${to}`)
    this.name = 'InvalidTransitionError'
  }
}

export class WorkflowStateMachine {
  constructor(private stage: WorkflowStage) {}

  get currentStage(): WorkflowStage {
    return this.stage
  }

  canTransition(target: WorkflowStage): boolean {
    return VALID_TRANSITIONS[this.stage] === target
  }

  transition(target: WorkflowStage): void {
    if (!this.canTransition(target)) {
      throw new InvalidTransitionError(this.stage, target)
    }
    this.stage = target
  }

  static isValidStage(value: string): value is WorkflowStage {
    return [
      'reception',
      'prescription',
      'dispensing',
      'review',
      'payment',
      'claim',
      'completed',
    ].includes(value)
  }
}
