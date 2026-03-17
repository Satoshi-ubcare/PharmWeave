import { NotFoundError, ConflictError, PreconditionError } from '../domain/errors'
import { CopayCalculator } from '../domain/CopayCalculator'
import type { InsuranceType, CopayExemption } from '../domain/CopayCalculator'
import {
  IPaymentRepository,
  PrismaPaymentRepository,
} from '../repositories/PaymentRepository'
import {
  IPrescriptionRepository,
  PrismaPrescriptionRepository,
} from '../repositories/PrescriptionRepository'
import {
  IVisitRepository,
  PrismaVisitRepository,
} from '../repositories/VisitRepository'
import type { Payment } from '@prisma/client'

const copayCalc = new CopayCalculator()

export class PaymentService {
  constructor(
    private readonly paymentRepo: IPaymentRepository = new PrismaPaymentRepository(),
    private readonly prescriptionRepo: IPrescriptionRepository = new PrismaPrescriptionRepository(),
    private readonly visitRepo: IVisitRepository = new PrismaVisitRepository(),
  ) {}

  async process(visitId: string, method: 'cash' | 'card' | 'transfer'): Promise<Payment> {
    const existing = await this.paymentRepo.findByVisitId(visitId)
    if (existing) throw new ConflictError('이미 수납이 완료된 방문입니다.')

    const visit = await this.visitRepo.findById(visitId)
    if (!visit) throw new NotFoundError('방문 정보가 없습니다.')

    const prescription = await this.prescriptionRepo.findByVisitId(visitId)
    if (!prescription || prescription.items.length === 0) {
      throw new PreconditionError('처방 정보가 없습니다.')
    }

    const insuranceType = visit.patient.insurance_type as InsuranceType
    const copayExemption = visit.patient.copay_exemption as CopayExemption

    const { totalDrugCost, copayAmount, insuranceCoverage } = copayCalc.calculate(
      prescription.items,
      insuranceType,
      copayExemption,
    )

    return this.paymentRepo.create({
      visit_id: visitId,
      total_drug_cost: totalDrugCost,
      copay_amount: copayAmount,
      insurance_coverage: insuranceCoverage,
      payment_method: method,
    })
  }

  async getByVisitId(visitId: string): Promise<Payment> {
    const payment = await this.paymentRepo.findByVisitId(visitId)
    if (!payment) throw new NotFoundError('수납 정보가 없습니다.')
    return payment
  }
}
