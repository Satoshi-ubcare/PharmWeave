import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { validate } from '../middlewares/validate'
import { AppError } from '../middlewares/errorHandler'

const router = Router()

const authSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6),
})

router.post('/login', validate(authSchema), async (req, res) => {
  const { username, password } = req.body as z.infer<typeof authSchema>

  const user = await prisma.user.findUnique({ where: { username } })
  if (!user) throw new AppError(401, '아이디 또는 비밀번호가 올바르지 않습니다.')

  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) throw new AppError(401, '아이디 또는 비밀번호가 올바르지 않습니다.')

  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET!,
    { expiresIn: '24h' },
  )
  res.json({ token })
})

router.post('/register', validate(authSchema), async (req, res) => {
  const { username, password } = req.body as z.infer<typeof authSchema>

  const existing = await prisma.user.findUnique({ where: { username } })
  if (existing) throw new AppError(409, '이미 사용 중인 아이디입니다.')

  const password_hash = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({ data: { username, password_hash } })

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '24h' })
  res.status(201).json({ token })
})

export default router
