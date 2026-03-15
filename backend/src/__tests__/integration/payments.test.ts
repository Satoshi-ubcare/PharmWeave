import request from 'supertest'
import jwt from 'jsonwebtoken'
import app from '../../index'
import { prisma } from '../../lib/prisma'

jest.mock('../../lib/prisma', () => ({
  prisma: {
    payment: { findUnique: jest.fn(), create: jest.fn() },
    prescription: { findUnique: jest.fn() },
  },
}))

type MockPrisma = {
  payment: { findUnique: jest.Mock; create: jest.Mock }
  prescription: { findUnique: jest.Mock }
}
const mock = prisma as unknown as MockPrisma

const JWT_SECRET = 'test-secret-key-for-integration-32chars'
let authToken: string

beforeAll(() => {
  process.env.JWT_SECRET = JWT_SECRET
  authToken = jwt.sign({ userId: 'test-user-id' }, JWT_SECRET, { expiresIn: '1h' })
})

afterEach(() => {
  jest.clearAllMocks()
})

const VISIT_ID = 'c3d4e5f6-a7b8-9012-cdef-123456789012'

const mockItems = [
  { unit_price: 145, quantity: 1, days: 60 },
  { unit_price: 195, quantity: 1, days: 60 },
]
const mockPrescription = {
  id: 'rx-uuid-002',
  visit_id: VISIT_ID,
  items: mockItems,
}

const totalDrugCost = 145 * 60 + 195 * 60 // 20400
const mockPayment = {
  id: 'pay-uuid-001',
  visit_id: VISIT_ID,
  total_drug_cost: totalDrugCost,
  copay_amount: Math.round(totalDrugCost * 0.3),
  insurance_coverage: totalDrugCost - Math.round(totalDrugCost * 0.3),
  payment_method: 'card',
  paid_at: new Date(),
}

describe('POST /api/visits/:visitId/payment', () => {
  it('수납을 처리하고 본인부담금을 계산하여 201을 반환한다', async () => {
    mock.payment.findUnique.mockResolvedValue(null)
    mock.prescription.findUnique.mockResolvedValue(mockPrescription)
    mock.payment.create.mockResolvedValue(mockPayment)

    const res = await request(app)
      .post(`/api/visits/${VISIT_ID}/payment`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ method: 'card' })

    expect(res.status).toBe(201)
    expect(res.body.total_drug_cost).toBe(totalDrugCost)
    expect(res.body.copay_amount).toBe(Math.round(totalDrugCost * 0.3))
  })

  it('이미 수납된 방문이면 409를 반환한다', async () => {
    mock.payment.findUnique.mockResolvedValue(mockPayment)

    const res = await request(app)
      .post(`/api/visits/${VISIT_ID}/payment`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ method: 'cash' })

    expect(res.status).toBe(409)
  })

  it('처방 정보가 없으면 422를 반환한다', async () => {
    mock.payment.findUnique.mockResolvedValue(null)
    mock.prescription.findUnique.mockResolvedValue(null)

    const res = await request(app)
      .post(`/api/visits/${VISIT_ID}/payment`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ method: 'cash' })

    expect(res.status).toBe(422)
  })

  it('잘못된 결제 방법은 400을 반환한다', async () => {
    const res = await request(app)
      .post(`/api/visits/${VISIT_ID}/payment`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ method: 'bitcoin' })

    expect(res.status).toBe(400)
  })

  it('약제비 1만원 미만이면 본인부담율 20%를 적용한다', async () => {
    const cheapItems = [{ unit_price: 85, quantity: 1, days: 1 }]
    const cheapCost = 85
    mock.payment.findUnique.mockResolvedValue(null)
    mock.prescription.findUnique.mockResolvedValue({ ...mockPrescription, items: cheapItems })
    mock.payment.create.mockResolvedValue({
      ...mockPayment,
      total_drug_cost: cheapCost,
      copay_amount: Math.round(cheapCost * 0.2),
    })

    const res = await request(app)
      .post(`/api/visits/${VISIT_ID}/payment`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ method: 'cash' })

    expect(res.status).toBe(201)
    expect(mock.payment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          copay_amount: Math.round(cheapCost * 0.2),
        }),
      }),
    )
  })
})

describe('GET /api/visits/:visitId/payment', () => {
  it('수납 정보를 반환한다', async () => {
    mock.payment.findUnique.mockResolvedValue(mockPayment)

    const res = await request(app)
      .get(`/api/visits/${VISIT_ID}/payment`)
      .set('Authorization', `Bearer ${authToken}`)

    expect(res.status).toBe(200)
    expect(res.body.payment_method).toBe('card')
  })

  it('수납 정보가 없으면 404를 반환한다', async () => {
    mock.payment.findUnique.mockResolvedValue(null)

    const res = await request(app)
      .get(`/api/visits/${VISIT_ID}/payment`)
      .set('Authorization', `Bearer ${authToken}`)

    expect(res.status).toBe(404)
  })
})
