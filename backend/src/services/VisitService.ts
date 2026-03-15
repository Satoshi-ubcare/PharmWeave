import { prisma } from '../lib/prisma'
import { AppError } from '../middlewares/errorHandler'
import { WorkflowStateMachine } from '../domain/WorkflowStateMachine'
import type { WorkflowStage } from '../domain/WorkflowStateMachine'

export class VisitService {
  async create(patient_id: string) {
    const patient = await prisma.patient.findUnique({ where: { id: patient_id } })
    if (!patient) throw new AppError(404, '환자를 찾을 수 없습니다.')

    return prisma.visit.create({
      data: { patient_id },
      include: { patient: true },
    })
  }

  async getToday(stage?: WorkflowStage) {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    const end = new Date()
    end.setHours(23, 59, 59, 999)

    return prisma.visit.findMany({
      where: {
        visited_at: { gte: start, lte: end },
        ...(stage ? { workflow_stage: stage } : {}),
      },
      include: { patient: true },
      orderBy: { visited_at: 'asc' },
    })
  }

  async getById(id: string) {
    const visit = await prisma.visit.findUnique({
      where: { id },
      include: { patient: true },
    })
    if (!visit) throw new AppError(404, '방문 기록을 찾을 수 없습니다.')
    return visit
  }

  async transitionStage(id: string, stage: WorkflowStage) {
    const visit = await prisma.visit.findUnique({ where: { id } })
    if (!visit) throw new AppError(404, '방문 기록을 찾을 수 없습니다.')

    const sm = new WorkflowStateMachine(visit.workflow_stage as WorkflowStage)
    if (!sm.canTransition(stage)) {
      throw new AppError(422, `${visit.workflow_stage} → ${stage} 전환은 허용되지 않습니다.`)
    }

    await this.validateStageGuards(id, stage)

    return prisma.visit.update({
      where: { id },
      data: { workflow_stage: stage },
      include: { patient: true },
    })
  }

  private async validateStageGuards(visitId: string, stage: WorkflowStage): Promise<void> {
    if (stage === 'review') {
      const prescription = await prisma.prescription.findUnique({
        where: { visit_id: visitId },
        include: { items: true },
      })
      if (!prescription || prescription.items.length === 0) {
        throw new AppError(422, '처방 항목이 1개 이상 있어야 조제 완료가 가능합니다.')
      }
    }

    if (stage === 'claim') {
      const payment = await prisma.payment.findUnique({ where: { visit_id: visitId } })
      if (!payment) {
        throw new AppError(422, '수납이 완료되어야 청구가 가능합니다.')
      }
    }
  }
}
