import { prisma } from '../lib/prisma'
import { AppError } from '../middlewares/errorHandler'
import { executeMedicationGuide } from '../plugins/medicationGuide'
import { executeDur } from '../plugins/durPlugin'
import {
  IPluginRepository,
  PrismaPluginRepository,
} from '../repositories/PluginRepository'
import type { PluginConfig } from '@prisma/client'

export class PluginService {
  constructor(
    private readonly pluginRepo: IPluginRepository = new PrismaPluginRepository(),
  ) {}

  async list(): Promise<PluginConfig[]> {
    return this.pluginRepo.findAll()
  }

  async toggle(id: string, enabled: boolean): Promise<PluginConfig> {
    const plugin = await this.pluginRepo.findById(id)
    if (!plugin) throw new AppError(404, 'Plugin을 찾을 수 없습니다.')

    return this.pluginRepo.update(id, enabled)
  }

  async execute(id: string, visitId: string): Promise<unknown> {
    const plugin = await this.pluginRepo.findById(id)
    if (!plugin) throw new AppError(404, 'Plugin을 찾을 수 없습니다.')
    if (!plugin.enabled) {
      return { skipped: true, reason: 'Plugin이 비활성화되어 있습니다.' }
    }

    switch (id) {
      case 'medication-guide':
        return executeMedicationGuide(visitId, prisma)
      case 'dur':
        return executeDur(visitId, prisma)
      default:
        throw new AppError(400, `알 수 없는 Plugin: ${id}`)
    }
  }
}
