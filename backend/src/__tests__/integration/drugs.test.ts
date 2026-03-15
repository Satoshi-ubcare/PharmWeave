import request from 'supertest'
import jwt from 'jsonwebtoken'
import app from '../../index'
import { prisma } from '../../lib/prisma'

jest.mock('../../lib/prisma', () => ({
  prisma: {
    drug: {
      findMany: jest.fn(),
    },
  },
}))

const mockDrugModel = prisma.drug as unknown as { findMany: jest.Mock }

const JWT_SECRET = 'test-secret-key-for-integration-32chars'
let authToken: string

beforeAll(() => {
  process.env.JWT_SECRET = JWT_SECRET
  authToken = jwt.sign({ userId: 'test-user-id' }, JWT_SECRET, { expiresIn: '1h' })
})

afterEach(() => {
  jest.clearAllMocks()
})

const mockDrugs = [
  { id: 'drug-1', drug_code: 'AMX001', drug_name: '아목시실린', unit_price: 500 },
  { id: 'drug-2', drug_code: 'IBU001', drug_name: '이부프로펜', unit_price: 300 },
]

describe('GET /api/drugs', () => {
  it('검색어 없이 요청하면 전체 목록을 반환한다', async () => {
    mockDrugModel.findMany.mockResolvedValue(mockDrugs)

    const res = await request(app)
      .get('/api/drugs')
      .set('Authorization', `Bearer ${authToken}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('검색어 q로 약품을 필터링하여 반환한다', async () => {
    mockDrugModel.findMany.mockResolvedValue([mockDrugs[0]])

    const res = await request(app)
      .get('/api/drugs?q=아목시실린')
      .set('Authorization', `Bearer ${authToken}`)

    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
    expect(res.body[0].drug_name).toBe('아목시실린')
  })

  it('검색 결과가 없으면 빈 배열을 반환한다', async () => {
    mockDrugModel.findMany.mockResolvedValue([])

    const res = await request(app)
      .get('/api/drugs?q=존재하지않는약품')
      .set('Authorization', `Bearer ${authToken}`)

    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })

  it('약품명을 포함한 여러 결과를 반환한다', async () => {
    mockDrugModel.findMany.mockResolvedValue(mockDrugs)

    const res = await request(app)
      .get('/api/drugs?q=이부')
      .set('Authorization', `Bearer ${authToken}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })
})
