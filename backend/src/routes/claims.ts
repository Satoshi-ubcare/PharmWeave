import { Router } from 'express'
import { ClaimService } from '../services/ClaimService'

const router = Router()
const claimService = new ClaimService()

router.post('/:visitId/claim', async (req, res) => {
  const claim = await claimService.create(req.params.visitId)
  res.status(201).json(claim)
})

router.get('/:visitId/claim', async (req, res) => {
  const claim = await claimService.getByVisitId(req.params.visitId)
  res.json(claim)
})

export default router
