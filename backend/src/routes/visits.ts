import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { validate } from '../middlewares/validate'
import { AppError } from '../middlewares/errorHandler'
import { WorkflowStateMachine } from '../domain/WorkflowStateMachine'
import type { WorkflowStage } from '../domain/WorkflowStateMachine'

const router = Router()

const createVisitSchema = z.object({
  patient_id: z.string().uuid(),
})

const stageSchema = z.object({
  stage: z.enum(['reception', 'prescription', 'dispensing', 'review', 'payment', 'claim', 'completed']),
})

router.post('/', validate(createVisitSchema), async (req, res) => {
  const { patient_id } = req.body as z.infer<typeof createVisitSchema>

  const patient = await prisma.patient.findUnique({ where: { id: patient_id } })
  if (!patient) throw new AppError(404, '환자를 찾을 수 없습니다.')

  const visit = await prisma.visit.create({
    data: { patient_id },
    include: { patient: true },
  })
  res.status(201).json(visit)
})

router.get('/today', async (_req, res) => {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const end = new Date()
  end.setHours(23, 59, 59, 999)

  const visits = await prisma.visit.findMany({
    where: { visited_at: { gte: start, lte: end } },
    include: { patient: true },
    orderBy: { visited_at: 'desc' },
  })
  res.json(visits)
})

router.get('/:id', async (req, res) => {
  const visit = await prisma.visit.findUnique({
    where: { id: req.params.id },
    include: { patient: true },
  })
  if (!visit) throw new AppError(404, '방문 기록을 찾을 수 없습니다.')
  res.json(visit)
})

router.patch('/:id/stage', validate(stageSchema), async (req, res) => {
  const { stage } = req.body as z.infer<typeof stageSchema>

  const visit = await prisma.visit.findUnique({ where: { id: req.params.id } })
  if (!visit) throw new AppError(404, '방문 기록을 찾을 수 없습니다.')

  const sm = new WorkflowStateMachine(visit.workflow_stage as WorkflowStage)
  if (!sm.canTransition(stage as WorkflowStage)) {
    throw new AppError(422, `${visit.workflow_stage} → ${stage} 전환은 허용되지 않습니다.`)
  }

  // 단계별 전환 가드
  if (stage === 'review') {
    const prescription = await prisma.prescription.findUnique({
      where: { visit_id: req.params.id },
      include: { items: true },
    })
    if (!prescription || prescription.items.length === 0) {
      throw new AppError(422, '처방 항목이 1개 이상 있어야 조제 완료가 가능합니다.')
    }
  }

  if (stage === 'claim') {
    const payment = await prisma.payment.findUnique({ where: { visit_id: req.params.id } })
    if (!payment) {
      throw new AppError(422, '수납이 완료되어야 청구가 가능합니다.')
    }
  }

  const updated = await prisma.visit.update({
    where: { id: req.params.id },
    data: { workflow_stage: stage as WorkflowStage },
    include: { patient: true },
  })
  res.json(updated)
})

export default router
