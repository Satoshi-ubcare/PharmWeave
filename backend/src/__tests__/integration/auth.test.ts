import request from 'supertest'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import app from '../../index'
import { prisma } from '../../lib/prisma'

// Prisma 싱글톤 모킹 (실제 DB 불필요)
jest.mock('../../lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}))

const mockUser = prisma.user as unknown as {
  findUnique: jest.Mock
  create: jest.Mock
}

beforeAll(() => {
  process.env.JWT_SECRET = 'test-secret-key-for-integration-32chars'
})

afterEach(() => {
  jest.clearAllMocks()
})

describe('POST /api/auth/register', () => {
  it('신규 사용자 등록 시 201과 token을 반환한다', async () => {
    mockUser.findUnique.mockResolvedValue(null)
    mockUser.create.mockResolvedValue({
      id: 'user-uuid-1',
      username: 'pharmacist1',
      password_hash: 'hashed',
    })

    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'pharmacist1', password: 'pass123' })

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('token')
    expect(typeof res.body.token).toBe('string')
  })

  it('이미 존재하는 username 등록 시 409를 반환한다', async () => {
    mockUser.findUnique.mockResolvedValue({ id: 'existing', username: 'pharmacist1' })

    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'pharmacist1', password: 'pass123' })

    expect(res.status).toBe(409)
    expect(res.body).toHaveProperty('error')
  })

  it('짧은 username/password는 400을 반환한다', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'ab', password: '123' })

    expect(res.status).toBe(400)
  })
})

describe('POST /api/auth/login', () => {
  it('올바른 자격증명으로 200과 token을 반환한다', async () => {
    const passwordHash = await bcrypt.hash('pass123', 10)
    mockUser.findUnique.mockResolvedValue({
      id: 'user-uuid-1',
      username: 'pharmacist1',
      password_hash: passwordHash,
    })

    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'pharmacist1', password: 'pass123' })

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('token')
    const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET!) as { userId: string }
    expect(decoded.userId).toBe('user-uuid-1')
  })

  it('존재하지 않는 사용자는 401을 반환한다', async () => {
    mockUser.findUnique.mockResolvedValue(null)

    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'ghost', password: 'pass123' })

    expect(res.status).toBe(401)
  })

  it('비밀번호 불일치 시 401을 반환한다', async () => {
    const passwordHash = await bcrypt.hash('correct-pass', 10)
    mockUser.findUnique.mockResolvedValue({
      id: 'user-uuid-1',
      username: 'pharmacist1',
      password_hash: passwordHash,
    })

    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'pharmacist1', password: 'wrong-pass' })

    expect(res.status).toBe(401)
  })
})
