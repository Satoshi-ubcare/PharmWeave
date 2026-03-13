import { Router } from 'express'
import { prisma } from '../lib/prisma'

const router = Router()

router.get('/', async (req, res) => {
  const q = String(req.query.q ?? '')
  const drugs = await prisma.drug.findMany({
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
  res.json(drugs)
})

export default router
