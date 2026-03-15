import request from 'supertest'
import jwt from 'jsonwebtoken'
import app from '../../index'
import { prisma } from '../../lib/prisma'

jest.mock('../../lib/prisma', () => ({
  prisma: {
    pluginConfig: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    prescription: {
      findUnique: jest.fn(),
    },
  },
}))

type MockModel<T extends string> = Record<T, jest.Mock>
const mockPlugin = prisma.pluginConfig as unknown as MockModel<'findMany' | 'findUnique' | 'update'>
const mockPrescriptionModel = prisma.prescription as unknown as MockModel<'findUnique'>

const JWT_SECRET = 'test-secret-key-for-integration-32chars'
let authToken: string

beforeAll(() => {
  process.env.JWT_SECRET = JWT_SECRET
  authToken = jwt.sign({ userId: 'test-user-id' }, JWT_SECRET, { expiresIn: '1h' })
})

afterEach(() => {
  jest.clearAllMocks()
})

const pluginDur = { id: 'dur', enabled: true }
const pluginMedGuide = { id: 'medication-guide', enabled: true }
const pluginDisabled = { id: 'dur', enabled: false }

describe('GET /api/plugins', () => {
  it('플러그인 목록을 반환한다', async () => {
    mockPlugin.findMany.mockResolvedValue([pluginDur, pluginMedGuide])

    const res = await request(app)
      .get('/api/plugins')
      .set('Authorization', `Bearer ${authToken}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body).toHaveLength(2)
  })

  it('플러그인이 없으면 빈 배열을 반환한다', async () => {
    mockPlugin.findMany.mockResolvedValue([])

    const res = await request(app)
      .get('/api/plugins')
      .set('Authorization', `Bearer ${authToken}`)

    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })
})

describe('PATCH /api/plugins/:id', () => {
  it('플러그인 활성화 상태를 토글한다', async () => {
    mockPlugin.findUnique.mockResolvedValue(pluginDur)
    mockPlugin.update.mockResolvedValue({ ...pluginDur, enabled: false })

    const res = await request(app)
      .patch('/api/plugins/dur')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ enabled: false })

    expect(res.status).toBe(200)
    expect(res.body.enabled).toBe(false)
  })

  it('존재하지 않는 플러그인 토글 시 404를 반환한다', async () => {
    mockPlugin.findUnique.mockResolvedValue(null)

    const res = await request(app)
      .patch('/api/plugins/nonexistent')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ enabled: true })

    expect(res.status).toBe(404)
  })

  it('잘못된 body(enabled 누락)는 400을 반환한다', async () => {
    const res = await request(app)
      .patch('/api/plugins/dur')
      .set('Authorization', `Bearer ${authToken}`)
      .send({})

    expect(res.status).toBe(400)
  })
})

describe('POST /api/plugins/:id/execute', () => {
  it('비활성화된 플러그인 실행 시 skipped 응답을 반환한다', async () => {
    mockPlugin.findUnique.mockResolvedValue(pluginDisabled)

    const res = await request(app)
      .post('/api/plugins/dur/execute')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ visitId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })

    expect(res.status).toBe(200)
    expect(res.body.skipped).toBe(true)
  })

  it('DUR 플러그인 실행 시 200과 결과를 반환한다', async () => {
    mockPlugin.findUnique.mockResolvedValue(pluginDur)
    mockPrescriptionModel.findUnique.mockResolvedValue({
      visit_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      items: [
        { drug_name: '이부프로펜', quantity: 1, days: 3 },
        { drug_name: '아스피린', quantity: 1, days: 3 },
      ],
    })

    const res = await request(app)
      .post('/api/plugins/dur/execute')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ visitId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('warnings')
    expect(res.body.status).toBe('warning')
  })

  it('medication-guide 플러그인 실행 시 200과 가이드를 반환한다', async () => {
    mockPlugin.findUnique.mockResolvedValue(pluginMedGuide)
    mockPrescriptionModel.findUnique.mockResolvedValue({
      visit_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      items: [{ drug_name: '타이레놀', quantity: 2, days: 5 }],
    })

    const res = await request(app)
      .post('/api/plugins/medication-guide/execute')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ visitId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('guides')
    expect(res.body.guides).toHaveLength(1)
  })

  it('알 수 없는 플러그인 실행 시 400을 반환한다', async () => {
    mockPlugin.findUnique.mockResolvedValue({ id: 'unknown-plugin', enabled: true })

    const res = await request(app)
      .post('/api/plugins/unknown-plugin/execute')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ visitId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })

    expect(res.status).toBe(400)
  })

  it('잘못된 UUID visitId는 400을 반환한다', async () => {
    const res = await request(app)
      .post('/api/plugins/dur/execute')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ visitId: 'not-a-uuid' })

    expect(res.status).toBe(400)
  })
})
