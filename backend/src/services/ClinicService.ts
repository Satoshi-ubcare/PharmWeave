import {
  IClinicRepository,
  PrismaClinicRepository,
} from '../repositories/ClinicRepository'
import type { Clinic } from '@prisma/client'

export class ClinicService {
  constructor(
    private readonly clinicRepo: IClinicRepository = new PrismaClinicRepository(),
  ) {}

  async search(q: string): Promise<Clinic[]> {
    return this.clinicRepo.search(q)
  }

  async upsert(name: string): Promise<Clinic> {
    return this.clinicRepo.upsert(name.trim())
  }

  async update(id: string, data: { phone?: string | null; address?: string | null }): Promise<Clinic> {
    return this.clinicRepo.update(id, data)
  }

  async delete(id: string): Promise<void> {
    await this.clinicRepo.deleteById(id)
  }
}
