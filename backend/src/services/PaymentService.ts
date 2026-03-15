import { prisma } from '../lib/prisma'
import { AppError } from '../middlewares/errorHandler'
import { CopayCalculator } from '../domain/CopayCalculator'

const copayCalc = new CopayCalculator()

export class PaymentService {
  async process(visitId: string, method: 'cash' | 'card' | 'transfer') {
    const existing = await prisma.payment.findUnique({ where: { visit_id: visitId } })
    if (existing) throw new AppError(409, '이미 수납이 완료된 방문입니다.')

    const prescription = await prisma.prescription.findUnique({
      where: { visit_id: visitId },
      include: { items: true },
    })
    if (!prescription || prescription.items.length === 0) {
      throw new AppError(422, '처방 정보가 없습니다.')
    }

    const { totalDrugCost, copayAmount, insuranceCoverage } = copayCalc.calculate(
      prescription.items,
    )

    return prisma.payment.create({
      data: {
        visit_id: visitId,
        total_drug_cost: totalDrugCost,
        copay_amount: copayAmount,
        insurance_coverage: insuranceCoverage,
        payment_method: method,
      },
    })
  }

  async getByVisitId(visitId: string) {
    const payment = await prisma.payment.findUnique({ where: { visit_id: visitId } })
    if (!payment) throw new AppError(404, '수납 정보가 없습니다.')
    return payment
  }
}
