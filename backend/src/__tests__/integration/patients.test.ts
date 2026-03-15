import request from 'supertest'
import jwt from 'jsonwebtoken'
import app from '../../index'
import { prisma } from '../../lib/prisma'

jest.mock('../../lib/prisma', () => ({
  prisma: {
    patient: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}))

const mockPatientModel = prisma.patient as unknown as {
  findMany: jest.Mock
  findUnique: jest.Mock
  create: jest.Mock
}

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
  phone: '01012345678',
  created_at: new Date(),
}

describe('GET /api/patients', () => {
  it('환자가 없을 때 빈 배열을 반환한다', async () => {
    mockPatientModel.findMany.mockResolvedValue([])

    const res = await request(app)
      .get('/api/patients')
      .set('Authorization', `Bearer ${authToken}`)

    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })

  it('검색어 없이 전체 환자 목록을 반환한다', async () => {
    mockPatientModel.findMany.mockResolvedValue([mockPatient])

    const res = await request(app)
      .get('/api/patients')
      .set('Authorization', `Bearer ${authToken}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body).toHaveLength(1)
    expect(res.body[0].name).toBe('홍길동')
  })

  it('이름으로 환자를 검색한다', async () => {
    mockPatientModel.findMany.mockResolvedValue([mockPatient])

    const res = await request(app)
      .get('/api/patients?q=홍길동')
      .set('Authorization', `Bearer ${authToken}`)

    expect(res.status).toBe(200)
    expect(mockPatientModel.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({ name: expect.objectContaining({ contains: '홍길동' }) }),
          ]),
        }),
      }),
    )
  })
})

describe('POST /api/patients', () => {
  it('신규 환자를 등록하고 201을 반환한다', async () => {
    mockPatientModel.findUnique.mockResolvedValue(null)
    mockPatientModel.create.mockResolvedValue(mockPatient)

    const res = await request(app)
      .post('/api/patients')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: '홍길동', birth_date: '1990-05-15', phone: '01012345678' })

    expect(res.status).toBe(201)
    expect(res.body.name).toBe('홍길동')
  })

  it('동일한 이름+생년월일 환자가 존재하면 409를 반환한다', async () => {
    mockPatientModel.findUnique.mockResolvedValue(mockPatient)

    const res = await request(app)
      .post('/api/patients')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: '홍길동', birth_date: '1990-05-15' })

    expect(res.status).toBe(409)
  })

  it('필수 필드 누락 시 400을 반환한다', async () => {
    const res = await request(app)
      .post('/api/patients')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ name: '홍' }) // birth_date 누락, name 너무 짧음

    expect(res.status).toBe(400)
  })
})

describe('GET /api/patients/:id', () => {
  it('존재하는 환자를 반환한다', async () => {
    mockPatientModel.findUnique.mockResolvedValue(mockPatient)

    const res = await request(app)
      .get('/api/patients/a1b2c3d4-e5f6-7890-abcd-ef1234567890')
      .set('Authorization', `Bearer ${authToken}`)

    expect(res.status).toBe(200)
    expect(res.body.id).toBe('a1b2c3d4-e5f6-7890-abcd-ef1234567890')
  })

  it('존재하지 않는 환자는 404를 반환한다', async () => {
    mockPatientModel.findUnique.mockResolvedValue(null)

    const res = await request(app)
      .get('/api/patients/nonexistent-id')
      .set('Authorization', `Bearer ${authToken}`)

    expect(res.status).toBe(404)
  })
})
