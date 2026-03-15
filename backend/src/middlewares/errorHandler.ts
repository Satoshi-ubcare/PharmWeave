import type { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import {
  DomainError,
  NotFoundError,
  ConflictError,
  WorkflowTransitionError,
  PreconditionError,
  DomainValidationError,
  UnauthorizedError,
} from '../domain/errors'

/** HTTP 상태 코드는 여기서만 결정 — 도메인 레이어는 HTTP에 의존하지 않는다 */
function domainErrorStatus(err: DomainError): number {
  if (err instanceof NotFoundError) return 404
  if (err instanceof ConflictError) return 409
  if (err instanceof WorkflowTransitionError) return 422
  if (err instanceof PreconditionError) return 422
  if (err instanceof DomainValidationError) return 400
  if (err instanceof UnauthorizedError) return 401
  return 500
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ZodError) {
    res.status(400).json({ error: 'Validation failed', details: err.errors })
    return
  }

  if (err instanceof DomainError) {
    res.status(domainErrorStatus(err)).json({ error: err.message })
    return
  }

  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
}
