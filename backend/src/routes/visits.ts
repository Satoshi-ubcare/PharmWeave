import { Router } from 'express'
import { z } from 'zod'
import { validate } from '../middlewares/validate'
import { VisitService } from '../services/VisitService'
import type { WorkflowStage } from '../domain/WorkflowStateMachine'

const router = Router()
const visitService = new VisitService()

const createVisitSchema = z.object({
  patient_id: z.string().uuid(),
})

const stageSchema = z.object({
  stage: z.enum(['reception', 'prescription', 'dispensing', 'review', 'payment', 'claim', 'completed']),
})

router.post('/', validate(createVisitSchema), async (req, res) => {
  const { patient_id } = req.body as z.infer<typeof createVisitSchema>
  const visit = await visitService.create(patient_id)
  res.status(201).json(visit)
})

router.get('/today', async (req, res) => {
  const stage = req.query.stage as WorkflowStage | undefined
  const visits = await visitService.getToday(stage)
  res.json(visits)
})

router.get('/:id', async (req, res) => {
  const visit = await visitService.getById(req.params.id)
  res.json(visit)
})

router.patch('/:id/stage', validate(stageSchema), async (req, res) => {
  const { stage } = req.body as z.infer<typeof stageSchema>
  const visit = await visitService.transitionStage(req.params.id, stage as WorkflowStage)
  res.json(visit)
})

export default router
