import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { AppError } from '../middlewares/errorHandler'
import { ClaimDataBuilder } from '../domain/ClaimDataBuilder'

const router = Router()
const claimBuilder = new ClaimDataBuilder()

router.post('/:visitId/claim', async (req, res) => {
  const { visitId } = req.params

  const existing = await prisma.claim.findUnique({ where: { visit_id: visitId } })
  if (existing) throw new AppError(409, '이미 청구가 완료된 방문입니다.')

  const visit = await prisma.visit.findUnique({
    where: { id: visitId },
    include: {
      patient: true,
      prescription: { include: { items: true } },
      payment: true,
    },
  })

  if (!visit) throw new AppError(404, '방문 기록을 찾을 수 없습니다.')
  if (!visit.prescription || visit.prescription.items.length === 0) {
    throw new AppError(422, '처방 정보가 없습니다.')
  }
  if (!visit.payment) throw new AppError(422, '수납 정보가 없습니다.')

  const claimData = claimBuilder.build({
    visit_id: visitId,
    patient_name: visit.patient.name,
    birth_date: visit.patient.birth_date.toISOString().split('T')[0],
    clinic_name: visit.prescription.clinic_name,
    doctor_name: visit.prescription.doctor_name,
    prescribed_at: visit.prescription.prescribed_at.toISOString().split('T')[0],
    items: visit.prescription.items,
    total_drug_cost: visit.payment.total_drug_cost,
    copay_amount: visit.payment.copay_amount,
    insurance_coverage: visit.payment.insurance_coverage,
  })

  const claim = await prisma.claim.create({
    data: {
      visit_id: visitId,
      claim_data: claimData as object,
    },
  })
  res.status(201).json(claim)
})

router.get('/:visitId/claim', async (req, res) => {
  const claim = await prisma.claim.findUnique({ where: { visit_id: req.params.visitId } })
  if (!claim) throw new AppError(404, '청구 정보가 없습니다.')
  res.json(claim)
})

export default router
