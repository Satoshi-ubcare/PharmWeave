import type { Claim, Patient, Visit, Prescription, PrescriptionItem, Payment } from '@prisma/client'
import { prisma } from '../lib/prisma'

export type VisitWithFull = Visit & {
  patient: Patient
  prescription: (Prescription & { items: PrescriptionItem[] }) | null
  payment: Payment | null
}

export interface IClaimRepository {
  findByVisitId(visitId: string): Promise<Claim | null>
  findVisitWithFull(visitId: string): Promise<VisitWithFull | null>
  create(visitId: string, claimData: object): Promise<Claim>
}

export class PrismaClaimRepository implements IClaimRepository {
  async findByVisitId(visitId: string): Promise<Claim | null> {
    return prisma.claim.findUnique({ where: { visit_id: visitId } })
  }

  async findVisitWithFull(visitId: string): Promise<VisitWithFull | null> {
    return prisma.visit.findUnique({
      where: { id: visitId },
      include: {
        patient: true,
        prescription: { include: { items: true } },
        payment: true,
      },
    })
  }

  async create(visitId: string, claimData: object): Promise<Claim> {
    return prisma.claim.create({
      data: { visit_id: visitId, claim_data: claimData },
    })
  }
}
