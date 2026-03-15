import type { Drug } from '@prisma/client'
import { prisma } from '../lib/prisma'

export interface IDrugRepository {
  search(q: string): Promise<Drug[]>
}

export class PrismaDrugRepository implements IDrugRepository {
  async search(q: string): Promise<Drug[]> {
    return prisma.drug.findMany({
      where: q
        ? {
            OR: [
              { drug_name: { contains: q, mode: 'insensitive' } },
              { drug_code: { contains: q } },
            ],
          }
        : undefined,
      orderBy: { drug_name: 'asc' },
      take: 20,
    })
  }
}
