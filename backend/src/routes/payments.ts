import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { validate } from '../middlewares/validate'
import { AppError } from '../middlewares/errorHandler'
import { CopayCalculator } from '../domain/CopayCalculator'

const router = Router()
const copayCalc = new CopayCalculator()

const paymentSchema = z.object({
  method: z.enum(['cash', 'card', 'transfer']),
})

router.post('/:visitId/payment', validate(paymentSchema), async (req, res) => {
  const { visitId } = req.params
  const { method } = req.body as z.infer<typeof paymentSchema>

  const existing = await prisma.payment.findUnique({ where: { visit_id: visitId } })
  if (existing) throw new AppError(409, '이미 수납이 완료된 방문입니다.')

  const prescription = await prisma.prescription.findUnique({
    where: { visit_id: visitId },
    include: { items: true },
  })
  if (!prescription || prescription.items.length === 0) {
    throw new AppError(422, '처방 정보가 없습니다.')
  }

  const { totalDrugCost, copayAmount, insuranceCoverage } = copayCalc.calculate(
    prescription.items,
  )

  const payment = await prisma.payment.create({
    data: {
      visit_id: visitId,
      total_drug_cost: totalDrugCost,
      copay_amount: copayAmount,
      insurance_coverage: insuranceCoverage,
      payment_method: method,
    },
  })
  res.status(201).json(payment)
})

router.get('/:visitId/payment', async (req, res) => {
  const payment = await prisma.payment.findUnique({ where: { visit_id: req.params.visitId } })
  if (!payment) throw new AppError(404, '수납 정보가 없습니다.')
  res.json(payment)
})

export default router
