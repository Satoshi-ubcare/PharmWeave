import { prisma } from '../lib/prisma'
import { AppError } from '../middlewares/errorHandler'
import type { Patient } from '@prisma/client'

export class PatientService {
  async search(q: string): Promise<Patient[]> {
    const dateCandidate = new Date(q)
    const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(q) && !isNaN(dateCandidate.getTime())

    return prisma.patient.findMany({
      where: q
        ? {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              ...(isValidDate ? [{ birth_date: { equals: dateCandidate } }] : []),
            ],
          }
        : undefined,
      orderBy: { name: 'asc' },
      take: 20,
    })
  }

  async create(name: string, birth_date: string, phone?: string): Promise<Patient> {
    const existing = await prisma.patient.findUnique({
      where: { name_birth_date: { name, birth_date: new Date(birth_date) } },
    })
    if (existing) throw new AppError(409, '동일한 이름과 생년월일의 환자가 이미 존재합니다.')

    return prisma.patient.create({
      data: { name, birth_date: new Date(birth_date), phone },
    })
  }

  async getById(id: string): Promise<Patient> {
    const patient = await prisma.patient.findUnique({ where: { id } })
    if (!patient) throw new AppError(404, '환자를 찾을 수 없습니다.')
    return patient
  }
}
