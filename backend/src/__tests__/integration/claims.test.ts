import request from 'supertest'
import jwt from 'jsonwebtoken'
import app from '../../index'
import { prisma } from '../../lib/prisma'

jest.mock('../../lib/prisma', () => ({
  prisma: {
    claim: { findUnique: jest.fn(), create: jest.fn() },
    visit: { findUnique: jest.fn() },
  },
}))

type MockPrisma = {
  claim: { findUnique: jest.Mock; create: jest.Mock }
  visit: { findUnique: jest.Mock }
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

const VISIT_ID = 'd4e5f6a7-b8c9-0123-defa-234567890123'

const mockVisitFull = {
  id: VISIT_ID,
  workflow_stage: 'claim',
  patient: {
    id: 'patient-uuid-01',
    name: '김민준',
    birth_date: new Date('1975-03-15'),
  },
  prescription: {
    clinic_name: '서울내과',
    doctor_name: '박성호',
    prescribed_at: new Date('2026-03-16'),
    items: [
      { id: 'item-1', drug_code: '170300040', drug_name: '메트포르민정500mg', unit_price: 75, quantity: 2, days: 90 },
    ],
  },
  payment: {
    total_drug_cost: 13500,
    copay_amount: 4050,
    insurance_coverage: 9450,
  },
}

const mockClaim = {
  id: 'claim-uuid-001',
  visit_id: VISIT_ID,
  claim_status: 'pending',
  claim_data: {
    visit_id: VISIT_ID,
    patient_name: '김민준',
    total_drug_cost: 13500,
    copay_amount: 4050,
  },
  created_at: new Date(),
}

describe('POST /api/visits/:visitId/claim', () => {
  it('청구 데이터를 생성하고 201을 반환한다', async () => {
    mock.claim.findUnique.mockResolvedValue(null)
    mock.visit.findUnique.mockResolvedValue(mockVisitFull)
    mock.claim.create.mockResolvedValue(mockClaim)

    const res = await request(app)
      .post(`/api/visits/${VISIT_ID}/claim`)
      .set('Authorization', `Bearer ${authToken}`)

    expect(res.status).toBe(201)
    expect(res.body.visit_id).toBe(VISIT_ID)
  })

  it('이미 청구된 방문이면 409를 반환한다', async () => {
    mock.claim.findUnique.mockResolvedValue(mockClaim)

    const res = await request(app)
      .post(`/api/visits/${VISIT_ID}/claim`)
      .set('Authorization', `Bearer ${authToken}`)

    expect(res.status).toBe(409)
  })

  it('방문 기록이 없으면 404를 반환한다', async () => {
    mock.claim.findUnique.mockResolvedValue(null)
    mock.visit.findUnique.mockResolvedValue(null)

    const res = await request(app)
      .post(`/api/visits/${VISIT_ID}/claim`)
      .set('Authorization', `Bearer ${authToken}`)

    expect(res.status).toBe(404)
  })

  it('처방 정보가 없으면 422를 반환한다', async () => {
    mock.claim.findUnique.mockResolvedValue(null)
    mock.visit.findUnique.mockResolvedValue({ ...mockVisitFull, prescription: null })

    const res = await request(app)
      .post(`/api/visits/${VISIT_ID}/claim`)
      .set('Authorization', `Bearer ${authToken}`)

    expect(res.status).toBe(422)
  })

  it('수납 정보가 없으면 422를 반환한다', async () => {
    mock.claim.findUnique.mockResolvedValue(null)
    mock.visit.findUnique.mockResolvedValue({ ...mockVisitFull, payment: null })

    const res = await request(app)
      .post(`/api/visits/${VISIT_ID}/claim`)
      .set('Authorization', `Bearer ${authToken}`)

    expect(res.status).toBe(422)
  })
})

describe('GET /api/visits/:visitId/claim', () => {
  it('청구 정보를 반환한다', async () => {
    mock.claim.findUnique.mockResolvedValue(mockClaim)

    const res = await request(app)
      .get(`/api/visits/${VISIT_ID}/claim`)
      .set('Authorization', `Bearer ${authToken}`)

    expect(res.status).toBe(200)
    expect(res.body.claim_status).toBe('pending')
  })

  it('청구 정보가 없으면 404를 반환한다', async () => {
    mock.claim.findUnique.mockResolvedValue(null)

    const res = await request(app)
      .get(`/api/visits/${VISIT_ID}/claim`)
      .set('Authorization', `Bearer ${authToken}`)

    expect(res.status).toBe(404)
  })
})
