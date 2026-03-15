import { Router } from 'express'
import { z } from 'zod'
import { validate } from '../middlewares/validate'
import { PrescriptionService } from '../services/PrescriptionService'

const router = Router()
const prescriptionService = new PrescriptionService()

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
  const input = req.body as z.infer<typeof prescriptionSchema>
  const prescription = await prescriptionService.upsert(visitId, input)
  res.status(201).json(prescription)
})

router.get('/:visitId/prescriptions', async (req, res) => {
  const prescription = await prescriptionService.getByVisitId(req.params.visitId)
  res.json(prescription)
})

export default router
