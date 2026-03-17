import { Router } from 'express'
import { z } from 'zod'
import { validate } from '../middlewares/validate'
import { PatientService } from '../services/PatientService'

const router = Router()
const patientService = new PatientService()

const createPatientSchema = z.object({
  name: z.string().min(2).max(50),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  phone: z.string().regex(/^\d{10,11}$/).optional(),
})

router.get('/', async (req, res) => {
  const q = String(req.query.q ?? '')
  const patients = await patientService.search(q)
  res.json(patients)
})

router.post('/', validate(createPatientSchema), async (req, res) => {
  const { name, birth_date, phone } = req.body as z.infer<typeof createPatientSchema>
  const patient = await patientService.create(name, birth_date, phone)
  res.status(201).json(patient)
})

router.get('/:id', async (req, res) => {
  const patient = await patientService.getById(req.params.id)
  res.json(patient)
})

const updatePatientSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  phone: z.string().regex(/^\d{10,11}$/).nullable().optional(),
})

router.patch('/:id', validate(updatePatientSchema), async (req, res) => {
  const input = req.body as z.infer<typeof updatePatientSchema>
  const patient = await patientService.update(req.params.id, input)
  res.json(patient)
})

export default router
