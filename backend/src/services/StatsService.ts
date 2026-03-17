import { prisma } from '../lib/prisma'
import type { WorkflowStage } from '../domain/WorkflowStateMachine'

export interface DashboardStats {
  totalVisits: number
  activeVisits: number
  completedVisits: number
  totalRevenue: number
  byStage: Partial<Record<WorkflowStage, number>>
  recentVisits: Array<{
    id: string
    patient: { name: string; birth_date: Date }
    workflow_stage: WorkflowStage
    visited_at: Date
    copay_amount: number | null
  }>
}

export class StatsService {
  async getToday(): Promise<DashboardStats> {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    const end = new Date()
    end.setHours(23, 59, 59, 999)

    const visits = await prisma.visit.findMany({
      where: { visited_at: { gte: start, lte: end } },
      include: { patient: true, payment: true },
      orderBy: { visited_at: 'desc' },
    })

    // 단계별 카운트
    const byStage: Partial<Record<WorkflowStage, number>> = {}
    for (const v of visits) {
      const stage = v.workflow_stage as WorkflowStage
      byStage[stage] = (byStage[stage] ?? 0) + 1
    }

    const completedVisits = byStage['completed'] ?? 0
    const totalRevenue = visits.reduce((sum, v) => sum + (v.payment?.copay_amount ?? 0), 0)

    const recentVisits = visits.slice(0, 15).map((v) => ({
      id: v.id,
      patient: { name: v.patient.name, birth_date: v.patient.birth_date },
      workflow_stage: v.workflow_stage as WorkflowStage,
      visited_at: v.visited_at,
      copay_amount: v.payment?.copay_amount ?? null,
    }))

    return {
      totalVisits: visits.length,
      activeVisits: visits.length - completedVisits,
      completedVisits,
      totalRevenue,
      byStage,
      recentVisits,
    }
  }
}
