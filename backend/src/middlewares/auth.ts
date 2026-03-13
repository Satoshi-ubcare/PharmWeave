import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { AppError } from './errorHandler'

export interface AuthRequest extends Request {
  userId?: string
}

export function authenticate(req: AuthRequest, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    throw new AppError(401, 'Authorization token required')
  }

  const token = header.slice(7)
  const secret = process.env.JWT_SECRET
  if (!secret) throw new AppError(500, 'JWT_SECRET not configured')

  const payload = jwt.verify(token, secret) as { userId: string }
  req.userId = payload.userId
  next()
}
