import { AppError } from '../middlewares/errorHandler'
import { ClaimDataBuilder } from '../domain/ClaimDataBuilder'
import {
  IClaimRepository,
  PrismaClaimRepository,
} from '../repositories/ClaimRepository'
import type { Claim } from '@prisma/client'

const claimBuilder = new ClaimDataBuilder()

export class ClaimService {
  constructor(
    private readonly claimRepo: IClaimRepository = new PrismaClaimRepository(),
  ) {}

  async create(visitId: string): Promise<Claim> {
    const existing = await this.claimRepo.findByVisitId(visitId)
    if (existing) throw new AppError(409, '이미 청구가 완료된 방문입니다.')

    const visit = await this.claimRepo.findVisitWithFull(visitId)
    if (!visit) throw new AppError(404, '방문 기록을 찾을 수 없습니다.')
    if (!visit.prescription || visit.prescription.items.length === 0) {
      throw new AppError(422, '처방 정보가 없습니다.')
    }
    if (!visit.payment) throw new AppError(422, '수납 정보가 없습니다.')

    const claimData = claimBuilder.build({
      visit_id: visitId,
      patient_name: visit.patient.name,
      birth_date: visit.patient.birth_date.toISOString().split('T')[0],
      clinic_name: visit.prescription.clinic_name,
      doctor_name: visit.prescription.doctor_name,
      prescribed_at: visit.prescription.prescribed_at.toISOString().split('T')[0],
      items: visit.prescription.items,
      total_drug_cost: visit.payment.total_drug_cost,
      copay_amount: visit.payment.copay_amount,
      insurance_coverage: visit.payment.insurance_coverage,
    })

    return this.claimRepo.create(visitId, claimData as object)
  }

  async getByVisitId(visitId: string): Promise<Claim> {
    const claim = await this.claimRepo.findByVisitId(visitId)
    if (!claim) throw new AppError(404, '청구 정보가 없습니다.')
    return claim
  }
}
