import { NotFoundError, ConflictError } from '../domain/errors'
import {
  IPatientRepository,
  PrismaPatientRepository,
} from '../repositories/PatientRepository'
import type { Patient } from '@prisma/client'

export interface PatientUpdateInput {
  name?: string
  birth_date?: string
  phone?: string | null
}

export class PatientService {
  constructor(
    private readonly patientRepo: IPatientRepository = new PrismaPatientRepository(),
  ) {}

  async search(q: string): Promise<Patient[]> {
    return this.patientRepo.search(q)
  }

  async create(name: string, birth_date: string, phone?: string): Promise<Patient> {
    const existing = await this.patientRepo.findByNameAndBirthDate(name, new Date(birth_date))
    if (existing) throw new ConflictError('동일한 이름과 생년월일의 환자가 이미 존재합니다.')

    return this.patientRepo.create(name, new Date(birth_date), phone)
  }

  async getById(id: string): Promise<Patient> {
    const patient = await this.patientRepo.findById(id)
    if (!patient) throw new NotFoundError('환자를 찾을 수 없습니다.')
    return patient
  }

  async update(id: string, input: PatientUpdateInput): Promise<Patient> {
    const existing = await this.patientRepo.findById(id)
    if (!existing) throw new NotFoundError('환자를 찾을 수 없습니다.')

    // 이름 또는 생년월일 변경 시 중복 검사
    if (input.name !== undefined || input.birth_date !== undefined) {
      const newName = input.name ?? existing.name
      const newBirthDate = input.birth_date ? new Date(input.birth_date) : existing.birth_date
      const duplicate = await this.patientRepo.findByNameAndBirthDate(newName, newBirthDate)
      if (duplicate && duplicate.id !== id) {
        throw new ConflictError('동일한 이름과 생년월일의 환자가 이미 존재합니다.')
      }
    }

    const data: { name?: string; birth_date?: Date; phone?: string | null } = {}
    if (input.name !== undefined) data.name = input.name
    if (input.birth_date !== undefined) data.birth_date = new Date(input.birth_date)
    if ('phone' in input) data.phone = input.phone ?? null

    return this.patientRepo.update(id, data)
  }
}
