import { AppError } from '../middlewares/errorHandler'
import {
  IPrescriptionRepository,
  PrismaPrescriptionRepository,
} from '../repositories/PrescriptionRepository'
import { IVisitRepository, PrismaVisitRepository } from '../repositories/VisitRepository'
import type { PrescriptionWithItems } from '../repositories/PrescriptionRepository'

interface UpsertPrescriptionInput {
  clinic_name: string
  doctor_name?: string
  prescribed_at: string
  items: {
    drug_code: string
    drug_name: string
    unit_price: number
    quantity: number
    days: number
  }[]
}

export class PrescriptionService {
  constructor(
    private readonly prescriptionRepo: IPrescriptionRepository = new PrismaPrescriptionRepository(),
    private readonly visitRepo: IVisitRepository = new PrismaVisitRepository(),
  ) {}

  async upsert(visitId: string, input: UpsertPrescriptionInput): Promise<PrescriptionWithItems> {
    const visit = await this.visitRepo.findById(visitId)
    if (!visit) throw new AppError(404, '방문 기록을 찾을 수 없습니다.')

    return this.prescriptionRepo.upsert(visitId, {
      ...input,
      prescribed_at: new Date(input.prescribed_at),
    })
  }

  async getByVisitId(visitId: string): Promise<PrescriptionWithItems> {
    const prescription = await this.prescriptionRepo.findByVisitId(visitId)
    if (!prescription) throw new AppError(404, '처방 정보가 없습니다.')
    return prescription
  }
}
