import { Router } from 'express'
import { z } from 'zod'
import { validate } from '../middlewares/validate'
import { ClinicService } from '../services/ClinicService'

const router = Router()
const clinicService = new ClinicService()

// GET /api/clinics?q=  — 검색 (빈 쿼리면 최근 20개)
router.get('/', async (req, res) => {
  const q = String(req.query.q ?? '')
  const clinics = await clinicService.search(q)
  res.json(clinics)
})

// POST /api/clinics — upsert (이름 기준)
const createClinicSchema = z.object({
  name: z.string().min(1).max(100),
  phone: z.string().max(20).optional(),
  address: z.string().max(200).optional(),
})

router.post('/', validate(createClinicSchema), async (req, res) => {
  const { name } = req.body as z.infer<typeof createClinicSchema>
  const clinic = await clinicService.upsert(name)
  res.status(201).json(clinic)
})

// PATCH /api/clinics/:id — 전화번호/주소 수정
const updateClinicSchema = z.object({
  phone: z.string().max(20).nullable().optional(),
  address: z.string().max(200).nullable().optional(),
})

router.patch('/:id', validate(updateClinicSchema), async (req, res) => {
  const data = req.body as z.infer<typeof updateClinicSchema>
  const clinic = await clinicService.update(req.params.id, data)
  res.json(clinic)
})

// DELETE /api/clinics/:id
router.delete('/:id', async (req, res) => {
  await clinicService.delete(req.params.id)
  res.status(204).send()
})

export default router
