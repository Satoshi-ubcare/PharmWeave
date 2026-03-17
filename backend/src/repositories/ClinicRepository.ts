import type { Clinic } from '@prisma/client'
import { prisma } from '../lib/prisma'

export interface IClinicRepository {
  search(q: string): Promise<Clinic[]>
  findByName(name: string): Promise<Clinic | null>
  upsert(name: string): Promise<Clinic>
  update(id: string, data: { phone?: string | null; address?: string | null }): Promise<Clinic>
  deleteById(id: string): Promise<void>
}

export class PrismaClinicRepository implements IClinicRepository {
  async search(q: string): Promise<Clinic[]> {
    return prisma.clinic.findMany({
      where: q ? { name: { contains: q, mode: 'insensitive' } } : undefined,
      orderBy: { name: 'asc' },
      take: 20,
    })
  }

  async findByName(name: string): Promise<Clinic | null> {
    return prisma.clinic.findUnique({ where: { name } })
  }

  async upsert(name: string): Promise<Clinic> {
    return prisma.clinic.upsert({
      where: { name },
      create: { name },
      update: {},
    })
  }

  async update(id: string, data: { phone?: string | null; address?: string | null }): Promise<Clinic> {
    return prisma.clinic.update({ where: { id }, data })
  }

  async deleteById(id: string): Promise<void> {
    await prisma.clinic.delete({ where: { id } })
  }
}
