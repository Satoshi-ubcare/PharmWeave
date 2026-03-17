import type { Patient, InsuranceType, CopayExemption } from '@prisma/client'
import { prisma } from '../lib/prisma'

export interface PatientUpdateData {
  name?: string
  birth_date?: Date
  phone?: string | null
  gender?: string | null
  allergies?: string | null
  insurance_type?: InsuranceType
  copay_exemption?: CopayExemption
}

export interface PatientCreateData {
  name: string
  birthDate: Date
  phone?: string
  gender?: string
  allergies?: string
  insurance_type?: InsuranceType
  copay_exemption?: CopayExemption
}

export interface IPatientRepository {
  search(q: string): Promise<Patient[]>
  findById(id: string): Promise<Patient | null>
  findByNameAndBirthDate(name: string, birthDate: Date): Promise<Patient | null>
  create(data: PatientCreateData): Promise<Patient>
  update(id: string, data: PatientUpdateData): Promise<Patient>
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

  async create(data: PatientCreateData): Promise<Patient> {
    return prisma.patient.create({
      data: {
        name: data.name,
        birth_date: data.birthDate,
        phone: data.phone,
        gender: data.gender,
        allergies: data.allergies,
        insurance_type: data.insurance_type,
        copay_exemption: data.copay_exemption,
      },
    })
  }

  async update(id: string, data: PatientUpdateData): Promise<Patient> {
    return prisma.patient.update({ where: { id }, data })
  }
}
