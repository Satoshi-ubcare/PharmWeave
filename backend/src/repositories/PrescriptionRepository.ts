import type { Prescription, PrescriptionItem } from '@prisma/client'
import { prisma } from '../lib/prisma'

export type PrescriptionWithItems = Prescription & { items: PrescriptionItem[] }

export interface PrescriptionUpsertInput {
  clinic_name: string
  doctor_name?: string
  prescribed_at: Date
  items: {
    drug_code: string
    drug_name: string
    unit_price: number
    quantity: number
    days: number
  }[]
}

export interface IPrescriptionRepository {
  findByVisitId(visitId: string): Promise<PrescriptionWithItems | null>
  upsert(visitId: string, input: PrescriptionUpsertInput): Promise<PrescriptionWithItems>
}

export class PrismaPrescriptionRepository implements IPrescriptionRepository {
  async findByVisitId(visitId: string): Promise<PrescriptionWithItems | null> {
    return prisma.prescription.findUnique({
      where: { visit_id: visitId },
      include: { items: true },
    })
  }

  async upsert(visitId: string, input: PrescriptionUpsertInput): Promise<PrescriptionWithItems> {
    const { clinic_name, doctor_name, prescribed_at, items } = input
    const existing = await prisma.prescription.findUnique({ where: { visit_id: visitId } })

    if (existing) {
      return prisma.prescription.update({
        where: { visit_id: visitId },
        data: {
          clinic_name,
          doctor_name,
          prescribed_at,
          items: {
            deleteMany: {},
            createMany: { data: items },
          },
        },
        include: { items: true },
      })
    }

    return prisma.prescription.create({
      data: {
        visit_id: visitId,
        clinic_name,
        doctor_name,
        prescribed_at,
        items: { createMany: { data: items } },
      },
      include: { items: true },
    })
  }
}
