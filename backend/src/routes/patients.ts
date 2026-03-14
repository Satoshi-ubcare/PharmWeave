import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { validate } from '../middlewares/validate'
import { AppError } from '../middlewares/errorHandler'

const router = Router()

const createPatientSchema = z.object({
  name: z.string().min(2).max(50),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  phone: z.string().regex(/^\d{10,11}$/).optional(),
})

router.get('/', async (req, res) => {
  const q = String(req.query.q ?? '')
  const dateCandidate = new Date(q)
  const isValidDate = q.match(/^\d{4}-\d{2}-\d{2}$/) && !isNaN(dateCandidate.getTime())

  const patients = await prisma.patient.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            ...(isValidDate ? [{ birth_date: { equals: dateCandidate } }] : []),
          ],
        }
      : undefined,
    orderBy: { name: 'asc' },
    take: 20,
  })
  res.json(patients)
})

router.post('/', validate(createPatientSchema), async (req, res) => {
  const { name, birth_date, phone } = req.body as z.infer<typeof createPatientSchema>

  const existing = await prisma.patient.findUnique({
    where: { name_birth_date: { name, birth_date: new Date(birth_date) } },
  })
  if (existing) throw new AppError(409, '동일한 이름과 생년월일의 환자가 이미 존재합니다.')

  const patient = await prisma.patient.create({
    data: { name, birth_date: new Date(birth_date), phone },
  })
  res.status(201).json(patient)
})

router.get('/:id', async (req, res) => {
  const patient = await prisma.patient.findUnique({ where: { id: req.params.id } })
  if (!patient) throw new AppError(404, '환자를 찾을 수 없습니다.')
  res.json(patient)
})

export default router
