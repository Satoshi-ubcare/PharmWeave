import { Router } from 'express'
import { z } from 'zod'
import { validate } from '../middlewares/validate'
import { PaymentService } from '../services/PaymentService'

const router = Router()
const paymentService = new PaymentService()

const paymentSchema = z.object({
  method: z.enum(['cash', 'card', 'transfer']),
})

router.post('/:visitId/payment', validate(paymentSchema), async (req, res) => {
  const { visitId } = req.params
  const { method } = req.body as z.infer<typeof paymentSchema>
  const payment = await paymentService.process(visitId, method)
  res.status(201).json(payment)
})

router.get('/:visitId/payment', async (req, res) => {
  const payment = await paymentService.getByVisitId(req.params.visitId)
  res.json(payment)
})

export default router
