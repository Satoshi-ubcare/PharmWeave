import { AppError } from '../middlewares/errorHandler'
import { WorkflowStateMachine } from '../domain/WorkflowStateMachine'
import type { WorkflowStage } from '../domain/WorkflowStateMachine'
import {
  IVisitRepository,
  PrismaVisitRepository,
} from '../repositories/VisitRepository'
import {
  IPrescriptionRepository,
  PrismaPrescriptionRepository,
} from '../repositories/PrescriptionRepository'
import {
  IPaymentRepository,
  PrismaPaymentRepository,
} from '../repositories/PaymentRepository'
import { IPatientRepository, PrismaPatientRepository } from '../repositories/PatientRepository'

export class VisitService {
  constructor(
    private readonly visitRepo: IVisitRepository = new PrismaVisitRepository(),
    private readonly patientRepo: IPatientRepository = new PrismaPatientRepository(),
    private readonly prescriptionRepo: IPrescriptionRepository = new PrismaPrescriptionRepository(),
    private readonly paymentRepo: IPaymentRepository = new PrismaPaymentRepository(),
  ) {}

  async create(patient_id: string) {
    const patient = await this.patientRepo.findById(patient_id)
    if (!patient) throw new AppError(404, '환자를 찾을 수 없습니다.')

    return this.visitRepo.create(patient_id)
  }

  async getToday(stage?: WorkflowStage) {
    return this.visitRepo.findToday(stage)
  }

  async getById(id: string) {
    const visit = await this.visitRepo.findById(id)
    if (!visit) throw new AppError(404, '방문 기록을 찾을 수 없습니다.')
    return visit
  }

  async transitionStage(id: string, stage: WorkflowStage) {
    const visit = await this.visitRepo.findById(id)
    if (!visit) throw new AppError(404, '방문 기록을 찾을 수 없습니다.')

    const sm = new WorkflowStateMachine(visit.workflow_stage as WorkflowStage)
    if (!sm.canTransition(stage)) {
      throw new AppError(422, `${visit.workflow_stage} → ${stage} 전환은 허용되지 않습니다.`)
    }

    await this.validateStageGuards(id, stage)

    return this.visitRepo.updateStage(id, stage)
  }

  private async validateStageGuards(visitId: string, stage: WorkflowStage): Promise<void> {
    if (stage === 'review') {
      const prescription = await this.prescriptionRepo.findByVisitId(visitId)
      if (!prescription || prescription.items.length === 0) {
        throw new AppError(422, '처방 항목이 1개 이상 있어야 조제 완료가 가능합니다.')
      }
    }

    if (stage === 'claim') {
      const payment = await this.paymentRepo.findByVisitId(visitId)
      if (!payment) {
        throw new AppError(422, '수납이 완료되어야 청구가 가능합니다.')
      }
    }
  }
}
