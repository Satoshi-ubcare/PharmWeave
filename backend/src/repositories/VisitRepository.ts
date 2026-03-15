import type { Patient, Visit } from '@prisma/client'
import { prisma } from '../lib/prisma'
import type { WorkflowStage } from '../domain/WorkflowStateMachine'

export type VisitWithPatient = Visit & { patient: Patient }

export interface IVisitRepository {
  create(patientId: string): Promise<VisitWithPatient>
  findById(id: string): Promise<VisitWithPatient | null>
  findToday(stage?: WorkflowStage): Promise<VisitWithPatient[]>
  updateStage(id: string, stage: WorkflowStage): Promise<VisitWithPatient>
}

export class PrismaVisitRepository implements IVisitRepository {
  async create(patientId: string): Promise<VisitWithPatient> {
    return prisma.visit.create({
      data: { patient_id: patientId },
      include: { patient: true },
    })
  }

  async findById(id: string): Promise<VisitWithPatient | null> {
    return prisma.visit.findUnique({
      where: { id },
      include: { patient: true },
    })
  }

  async findToday(stage?: WorkflowStage): Promise<VisitWithPatient[]> {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    const end = new Date()
    end.setHours(23, 59, 59, 999)

    return prisma.visit.findMany({
      where: {
        visited_at: { gte: start, lte: end },
        ...(stage ? { workflow_stage: stage } : {}),
      },
      include: { patient: true },
      orderBy: { visited_at: 'asc' },
    })
  }

  async updateStage(id: string, stage: WorkflowStage): Promise<VisitWithPatient> {
    return prisma.visit.update({
      where: { id },
      data: { workflow_stage: stage },
      include: { patient: true },
    })
  }
}
