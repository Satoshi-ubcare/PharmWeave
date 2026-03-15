import type { Payment } from '@prisma/client'
import { prisma } from '../lib/prisma'

export interface PaymentCreateInput {
  visit_id: string
  total_drug_cost: number
  copay_amount: number
  insurance_coverage: number
  payment_method: 'cash' | 'card' | 'transfer'
}

export interface IPaymentRepository {
  findByVisitId(visitId: string): Promise<Payment | null>
  create(input: PaymentCreateInput): Promise<Payment>
}

export class PrismaPaymentRepository implements IPaymentRepository {
  async findByVisitId(visitId: string): Promise<Payment | null> {
    return prisma.payment.findUnique({ where: { visit_id: visitId } })
  }

  async create(input: PaymentCreateInput): Promise<Payment> {
    return prisma.payment.create({ data: input })
  }
}
