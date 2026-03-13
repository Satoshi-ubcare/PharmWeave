import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { validate } from '../middlewares/validate'
import { AppError } from '../middlewares/errorHandler'

const router = Router()

const prescriptionSchema = z.object({
  clinic_name: z.string().min(1).max(100),
  doctor_name: z.string().max(50).optional(),
  prescribed_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  items: z
    .array(
      z.object({
        drug_code: z.string().min(1).max(20),
        drug_name: z.string().min(1).max(100),
        unit_price: z.number().int().positive(),
        quantity: z.number().int().positive(),
        days: z.number().int().positive(),
      }),
    )
    .min(1, '처방 항목은 1개 이상이어야 합니다.'),
})

router.post('/:visitId/prescriptions', validate(prescriptionSchema), async (req, res) => {
  const { visitId } = req.params
  const { clinic_name, doctor_name, prescribed_at, items } = req.body as z.infer<typeof prescriptionSchema>

  const visit = await prisma.visit.findUnique({ where: { id: visitId } })
  if (!visit) throw new AppError(404, '방문 기록을 찾을 수 없습니다.')

  const existing = await prisma.prescription.findUnique({ where: { visit_id: visitId } })
  if (existing) {
    const prescription = await prisma.prescription.update({
      where: { visit_id: visitId },
      data: {
        clinic_name,
        doctor_name,
        prescribed_at: new Date(prescribed_at),
        items: {
          deleteMany: {},
          createMany: { data: items },
        },
      },
      include: { items: true },
    })
    res.json(prescription)
    return
  }

  const prescription = await prisma.prescription.create({
    data: {
      visit_id: visitId,
      clinic_name,
      doctor_name,
      prescribed_at: new Date(prescribed_at),
      items: { createMany: { data: items } },
    },
    include: { items: true },
  })
  res.status(201).json(prescription)
})

router.get('/:visitId/prescriptions', async (req, res) => {
  const prescription = await prisma.prescription.findUnique({
    where: { visit_id: req.params.visitId },
    include: { items: true },
  })
  if (!prescription) throw new AppError(404, '처방 정보가 없습니다.')
  res.json(prescription)
})

export default router
