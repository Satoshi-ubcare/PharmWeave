import { PluginService } from '../PluginService'
import { NotFoundError, DomainValidationError } from '../../domain/errors'

// Plugin 실행 함수 모킹
jest.mock('../../plugins/medicationGuide', () => ({
  executeMedicationGuide: jest.fn().mockResolvedValue({
    visitId: 'visit-1',
    guides: [{ drug_name: '타이레놀', how_to_take: '1회 1정, 하루 3일 복용', warnings: [] }],
    generatedAt: '2026-03-16T00:00:00.000Z',
  }),
}))

jest.mock('../../plugins/durPlugin', () => ({
  executeDur: jest.fn().mockResolvedValue({
    visitId: 'visit-1',
    warnings: [],
    checkedAt: '2026-03-16T00:00:00.000Z',
    status: 'safe',
  }),
}))

// prisma 모킹 (execute 내부에서 직접 사용)
jest.mock('../../lib/prisma', () => ({
  prisma: {},
}))

const makeRepo = (overrides = {}) => ({
  findAll: jest.fn().mockResolvedValue([]),
  findById: jest.fn().mockResolvedValue(null),
  update: jest.fn(),
  ...overrides,
})

describe('PluginService.list()', () => {
  it('플러그인 전체 목록을 반환한다', async () => {
    const plugins = [{ id: 'dur', enabled: true }, { id: 'medication-guide', enabled: false }]
    const repo = makeRepo({ findAll: jest.fn().mockResolvedValue(plugins) })
    const service = new PluginService(repo)

    const result = await service.list()

    expect(result).toEqual(plugins)
    expect(repo.findAll).toHaveBeenCalledTimes(1)
  })
})

describe('PluginService.toggle()', () => {
  it('플러그인을 찾아 활성화 상태를 업데이트한다', async () => {
    const existing = { id: 'dur', enabled: true }
    const updated = { id: 'dur', enabled: false }
    const repo = makeRepo({
      findById: jest.fn().mockResolvedValue(existing),
      update: jest.fn().mockResolvedValue(updated),
    })
    const service = new PluginService(repo)

    const result = await service.toggle('dur', false)

    expect(result).toEqual(updated)
    expect(repo.update).toHaveBeenCalledWith('dur', false)
  })

  it('존재하지 않는 플러그인이면 NotFoundError를 던진다', async () => {
    const repo = makeRepo({ findById: jest.fn().mockResolvedValue(null) })
    const service = new PluginService(repo)

    await expect(service.toggle('nonexistent', true)).rejects.toThrow(NotFoundError)
  })
})

describe('PluginService.execute()', () => {
  it('존재하지 않는 플러그인이면 NotFoundError를 던진다', async () => {
    const repo = makeRepo({ findById: jest.fn().mockResolvedValue(null) })
    const service = new PluginService(repo)

    await expect(service.execute('nonexistent', 'visit-1')).rejects.toThrow(NotFoundError)
  })

  it('비활성화된 플러그인은 skipped 응답을 반환한다', async () => {
    const repo = makeRepo({ findById: jest.fn().mockResolvedValue({ id: 'dur', enabled: false }) })
    const service = new PluginService(repo)

    const result = await service.execute('dur', 'visit-1') as { skipped: boolean }

    expect(result.skipped).toBe(true)
  })

  it('medication-guide 플러그인을 실행하여 결과를 반환한다', async () => {
    const repo = makeRepo({
      findById: jest.fn().mockResolvedValue({ id: 'medication-guide', enabled: true }),
    })
    const service = new PluginService(repo)

    const result = await service.execute('medication-guide', 'visit-1') as { guides: unknown[] }

    expect(result).toHaveProperty('guides')
  })

  it('dur 플러그인을 실행하여 결과를 반환한다', async () => {
    const repo = makeRepo({
      findById: jest.fn().mockResolvedValue({ id: 'dur', enabled: true }),
    })
    const service = new PluginService(repo)

    const result = await service.execute('dur', 'visit-1') as { status: string }

    expect(result).toHaveProperty('warnings')
    expect(result.status).toBe('safe')
  })

  it('알 수 없는 플러그인 id는 DomainValidationError를 던진다', async () => {
    const repo = makeRepo({
      findById: jest.fn().mockResolvedValue({ id: 'unknown', enabled: true }),
    })
    const service = new PluginService(repo)

    await expect(service.execute('unknown', 'visit-1')).rejects.toThrow(DomainValidationError)
  })
})
