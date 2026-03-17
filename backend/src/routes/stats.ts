import { Router } from 'express'
import { StatsService } from '../services/StatsService'

const router = Router()
const statsService = new StatsService()

router.get('/today', async (_req, res) => {
  const stats = await statsService.getToday()
  res.json(stats)
})

export default router
