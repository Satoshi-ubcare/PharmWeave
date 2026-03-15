import { AppError } from '../middlewares/errorHandler'
import {
  IPatientRepository,
  PrismaPatientRepository,
} from '../repositories/PatientRepository'
import type { Patient } from '@prisma/client'

export class PatientService {
  constructor(
    private readonly patientRepo: IPatientRepository = new PrismaPatientRepository(),
  ) {}

  async search(q: string): Promise<Patient[]> {
    return this.patientRepo.search(q)
  }

  async create(name: string, birth_date: string, phone?: string): Promise<Patient> {
    const existing = await this.patientRepo.findByNameAndBirthDate(name, new Date(birth_date))
    if (existing) throw new AppError(409, '동일한 이름과 생년월일의 환자가 이미 존재합니다.')

    return this.patientRepo.create(name, new Date(birth_date), phone)
  }

  async getById(id: string): Promise<Patient> {
    const patient = await this.patientRepo.findById(id)
    if (!patient) throw new AppError(404, '환자를 찾을 수 없습니다.')
    return patient
  }
}
