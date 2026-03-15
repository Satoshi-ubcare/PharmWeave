import type { Patient } from '@prisma/client'
import { prisma } from '../lib/prisma'

export interface IPatientRepository {
  search(q: string): Promise<Patient[]>
  findById(id: string): Promise<Patient | null>
  findByNameAndBirthDate(name: string, birthDate: Date): Promise<Patient | null>
  create(name: string, birthDate: Date, phone?: string): Promise<Patient>
}

export class PrismaPatientRepository implements IPatientRepository {
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

  async findById(id: string): Promise<Patient | null> {
    return prisma.patient.findUnique({ where: { id } })
  }

  async findByNameAndBirthDate(name: string, birthDate: Date): Promise<Patient | null> {
    return prisma.patient.findUnique({
      where: { name_birth_date: { name, birth_date: birthDate } },
    })
  }

  async create(name: string, birthDate: Date, phone?: string): Promise<Patient> {
    return prisma.patient.create({
      data: { name, birth_date: birthDate, phone },
    })
  }
}
