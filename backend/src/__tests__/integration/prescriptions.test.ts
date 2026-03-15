import request from 'supertest'
import jwt from 'jsonwebtoken'
import app from '../../index'
import { prisma } from '../../lib/prisma'

jest.mock('../../lib/prisma', () => ({
  prisma: {
    visit: { findUnique: jest.fn() },
    prescription: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
  },
}))

type MockPrisma = {
  visit: { findUnique: jest.Mock }
  prescription: { findUnique: jest.Mock; create: jest.Mock; update: jest.Mock }
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

const VISIT_ID = 'b2c3d4e5-f6a7-8901-bcde-f12345678901'

const mockVisit = { id: VISIT_ID, workflow_stage: 'prescription' }

const mockPrescription = {
  id: 'rx-uuid-001',
  visit_id: VISIT_ID,
  clinic_name: '서울내과',
  doctor_name: '김의사',
  prescribed_at: new Date('2026-03-16'),
  items: [
    { id: 'item-1', drug_code: '497000540', drug_name: '타이레놀정500mg', unit_price: 85, quantity: 3, days: 5 },
  ],
}

const validPayload = {
  clinic_name: '서울내과',
  doctor_name: '김의사',
  prescribed_at: '2026-03-16',
  items: [{ drug_code: '497000540', drug_name: '타이레놀정500mg', unit_price: 85, quantity: 3, days: 5 }],
}

describe('POST /api/visits/:visitId/prescriptions', () => {
  it('신규 처방을 생성하고 201을 반환한다', async () => {
    mock.visit.findUnique.mockResolvedValue(mockVisit)
    mock.prescription.findUnique.mockResolvedValue(null)
    mock.prescription.create.mockResolvedValue(mockPrescription)

    const res = await request(app)
      .post(`/api/visits/${VISIT_ID}/prescriptions`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(validPayload)

    expect(res.status).toBe(201)
    expect(res.body.clinic_name).toBe('서울내과')
  })

  it('기존 처방이 있으면 update하고 201을 반환한다', async () => {
    mock.visit.findUnique.mockResolvedValue(mockVisit)
    mock.prescription.findUnique.mockResolvedValue(mockPrescription)
    mock.prescription.update.mockResolvedValue({ ...mockPrescription, clinic_name: '강남이비인후과' })

    const res = await request(app)
      .post(`/api/visits/${VISIT_ID}/prescriptions`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ ...validPayload, clinic_name: '강남이비인후과' })

    expect(res.status).toBe(201)
    expect(mock.prescription.update).toHaveBeenCalled()
  })

  it('존재하지 않는 방문이면 404를 반환한다', async () => {
    mock.visit.findUnique.mockResolvedValue(null)

    const res = await request(app)
      .post(`/api/visits/${VISIT_ID}/prescriptions`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(validPayload)

    expect(res.status).toBe(404)
  })

  it('처방 항목이 없으면 400을 반환한다', async () => {
    const res = await request(app)
      .post(`/api/visits/${VISIT_ID}/prescriptions`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ ...validPayload, items: [] })

    expect(res.status).toBe(400)
  })

  it('clinic_name 누락 시 400을 반환한다', async () => {
    const res = await request(app)
      .post(`/api/visits/${VISIT_ID}/prescriptions`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ prescribed_at: '2026-03-16', items: validPayload.items })

    expect(res.status).toBe(400)
  })
})

describe('GET /api/visits/:visitId/prescriptions', () => {
  it('처방 정보를 반환한다', async () => {
    mock.prescription.findUnique.mockResolvedValue(mockPrescription)

    const res = await request(app)
      .get(`/api/visits/${VISIT_ID}/prescriptions`)
      .set('Authorization', `Bearer ${authToken}`)

    expect(res.status).toBe(200)
    expect(res.body.clinic_name).toBe('서울내과')
    expect(Array.isArray(res.body.items)).toBe(true)
  })

  it('처방이 없으면 404를 반환한다', async () => {
    mock.prescription.findUnique.mockResolvedValue(null)

    const res = await request(app)
      .get(`/api/visits/${VISIT_ID}/prescriptions`)
      .set('Authorization', `Bearer ${authToken}`)

    expect(res.status).toBe(404)
  })
})
