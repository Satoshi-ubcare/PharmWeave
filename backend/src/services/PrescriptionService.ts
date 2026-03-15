import { prisma } from '../lib/prisma'
import { AppError } from '../middlewares/errorHandler'

interface PrescriptionItemInput {
  drug_code: string
  drug_name: string
  unit_price: number
  quantity: number
  days: number
}

interface UpsertPrescriptionInput {
  clinic_name: string
  doctor_name?: string
  prescribed_at: string
  items: PrescriptionItemInput[]
}

export class PrescriptionService {
  async upsert(visitId: string, input: UpsertPrescriptionInput) {
    const visit = await prisma.visit.findUnique({ where: { id: visitId } })
    if (!visit) throw new AppError(404, '방문 기록을 찾을 수 없습니다.')

    const { clinic_name, doctor_name, prescribed_at, items } = input
    const existing = await prisma.prescription.findUnique({ where: { visit_id: visitId } })

    if (existing) {
      return prisma.prescription.update({
        where: { visit_id: visitId },
        data: {
          clinic_name,
          doctor_name,
          prescribed_at: new Date(prescribed_at),
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
        prescribed_at: new Date(prescribed_at),
        items: { createMany: { data: items } },
      },
      include: { items: true },
    })
  }

  async getByVisitId(visitId: string) {
    const prescription = await prisma.prescription.findUnique({
      where: { visit_id: visitId },
      include: { items: true },
    })
    if (!prescription) throw new AppError(404, '처방 정보가 없습니다.')
    return prescription
  }
}
