import request from 'supertest'
import jwt from 'jsonwebtoken'
import app from '../../index'
import { prisma } from '../../lib/prisma'

jest.mock('../../lib/prisma', () => ({
  prisma: {
    patient: { findUnique: jest.fn() },
    visit: { create: jest.fn(), findUnique: jest.fn(), findMany: jest.fn(), update: jest.fn() },
    prescription: { findUnique: jest.fn() },
    payment: { findUnique: jest.fn() },
  },
}))

type MockModel<T extends string> = Record<T, jest.Mock>
const mockVisitModel = prisma.visit as unknown as MockModel<'create' | 'findUnique' | 'findMany' | 'update'>
const mockPatientModel = prisma.patient as unknown as MockModel<'findUnique'>
const mockPrescriptionModel = prisma.prescription as unknown as MockModel<'findUnique'>
const mockPaymentModel = prisma.payment as unknown as MockModel<'findUnique'>

const JWT_SECRET = 'test-secret-key-for-integration-32chars'
let authToken: string

beforeAll(() => {
  process.env.JWT_SECRET = JWT_SECRET
  authToken = jwt.sign({ userId: 'test-user-id' }, JWT_SECRET, { expiresIn: '1h' })
})

afterEach(() => {
  jest.clearAllMocks()
})

const mockPatient = {
  id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  name: '홍길동',
  birth_date: new Date('1990-05-15'),
  phone: null,
  created_at: new Date(),
}

const mockVisit = {
  id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  patient_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  workflow_stage: 'reception',
  visited_at: new Date(),
  created_at: new Date(),
  updated_at: new Date(),
  patient: mockPatient,
}

describe('POST /api/visits', () => {
  it('방문을 생성하고 201을 반환한다', async () => {
    mockPatientModel.findUnique.mockResolvedValue(mockPatient)
    mockVisitModel.create.mockResolvedValue(mockVisit)

    const res = await request(app)
      .post('/api/visits')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ patient_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })

    expect(res.status).toBe(201)
    expect(res.body.patient_id).toBe('a1b2c3d4-e5f6-7890-abcd-ef1234567890')
  })

  it('존재하지 않는 환자로 방문 생성 시 404를 반환한다', async () => {
    mockPatientModel.findUnique.mockResolvedValue(null)

    const res = await request(app)
      .post('/api/visits')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ patient_id: 'c3d4e5f6-a7b8-9012-cdef-123456789012' })

    expect(res.status).toBe(404)
  })

  it('UUID 형식이 아닌 patient_id는 400을 반환한다', async () => {
    const res = await request(app)
      .post('/api/visits')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ patient_id: 'not-a-uuid' })

    expect(res.status).toBe(400)
  })
})

describe('GET /api/visits/today', () => {
  it('오늘의 방문 목록을 반환한다', async () => {
    mockVisitModel.findMany.mockResolvedValue([mockVisit])

    const res = await request(app)
      .get('/api/visits/today')
      .set('Authorization', `Bearer ${authToken}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })
})

describe('PATCH /api/visits/:id/stage', () => {
  it('reception → prescription 전환이 성공한다', async () => {
    mockVisitModel.findUnique.mockResolvedValue(mockVisit)
    mockVisitModel.update.mockResolvedValue({ ...mockVisit, workflow_stage: 'prescription' })

    const res = await request(app)
      .patch('/api/visits/b2c3d4e5-f6a7-8901-bcde-f12345678901/stage')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ stage: 'prescription' })

    expect(res.status).toBe(200)
    expect(res.body.workflow_stage).toBe('prescription')
  })

  it('단계를 건너뛰는 전환은 422를 반환한다', async () => {
    mockVisitModel.findUnique.mockResolvedValue(mockVisit) // workflow_stage: 'reception'

    const res = await request(app)
      .patch('/api/visits/b2c3d4e5-f6a7-8901-bcde-f12345678901/stage')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ stage: 'dispensing' }) // reception → dispensing (건너뜀)

    expect(res.status).toBe(422)
    expect(res.body).toHaveProperty('error')
  })

  it('처방 항목 없이 review 진입 시 422를 반환한다', async () => {
    mockVisitModel.findUnique.mockResolvedValue({ ...mockVisit, workflow_stage: 'dispensing' })
    mockPrescriptionModel.findUnique.mockResolvedValue({ items: [] })

    const res = await request(app)
      .patch('/api/visits/b2c3d4e5-f6a7-8901-bcde-f12345678901/stage')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ stage: 'review' })

    expect(res.status).toBe(422)
  })

  it('수납 없이 claim 진입 시 422를 반환한다', async () => {
    mockVisitModel.findUnique.mockResolvedValue({ ...mockVisit, workflow_stage: 'payment' })
    mockPaymentModel.findUnique.mockResolvedValue(null)

    const res = await request(app)
      .patch('/api/visits/b2c3d4e5-f6a7-8901-bcde-f12345678901/stage')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ stage: 'claim' })

    expect(res.status).toBe(422)
  })

  it('존재하지 않는 방문은 404를 반환한다', async () => {
    mockVisitModel.findUnique.mockResolvedValue(null)

    const res = await request(app)
      .patch('/api/visits/nonexistent/stage')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ stage: 'prescription' })

    expect(res.status).toBe(404)
  })
})
