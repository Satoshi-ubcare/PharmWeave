import { Router } from 'express'
import { PrismaDrugRepository } from '../repositories/DrugRepository'

const router = Router()
const drugRepo = new PrismaDrugRepository()

router.get('/', async (req, res) => {
  const q = String(req.query.q ?? '')
  const drugs = await drugRepo.search(q)
  res.json(drugs)
})

export default router
