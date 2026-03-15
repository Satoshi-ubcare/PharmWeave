import type { PluginConfig } from '@prisma/client'
import { prisma } from '../lib/prisma'

export interface IPluginRepository {
  findAll(): Promise<PluginConfig[]>
  findById(id: string): Promise<PluginConfig | null>
  update(id: string, enabled: boolean): Promise<PluginConfig>
}

export class PrismaPluginRepository implements IPluginRepository {
  async findAll(): Promise<PluginConfig[]> {
    return prisma.pluginConfig.findMany()
  }

  async findById(id: string): Promise<PluginConfig | null> {
    return prisma.pluginConfig.findUnique({ where: { id } })
  }

  async update(id: string, enabled: boolean): Promise<PluginConfig> {
    return prisma.pluginConfig.update({
      where: { id },
      data: { enabled },
    })
  }
}
