/**
 * 도메인 에러 계층
 *
 * HTTP 상태 코드는 errorHandler에서 매핑 — 도메인 레이어는 HTTP에 의존하지 않는다.
 *
 * NotFoundError        → 404  (리소스 없음)
 * ConflictError        → 409  (중복/충돌)
 * WorkflowTransitionError → 422 (단계 전환 불가)
 * PreconditionError    → 422  (전제조건 미충족)
 * DomainValidationError → 400 (도메인 입력 오류)
 */
export class DomainError extends Error {
  constructor(message: string) {
    super(message)
    this.name = this.constructor.name
  }
}

export class NotFoundError extends DomainError {}

export class ConflictError extends DomainError {}

export class WorkflowTransitionError extends DomainError {
  constructor(from: string, to: string) {
    super(`${from} → ${to} 전환은 허용되지 않습니다.`)
  }
}

export class PreconditionError extends DomainError {}

export class DomainValidationError extends DomainError {}

export class UnauthorizedError extends DomainError {}
