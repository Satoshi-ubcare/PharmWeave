import { describe, it, expect, beforeEach } from 'vitest'
import { usePluginStore } from '../pluginStore'
import type { Plugin } from '@/types'

const mockPlugins: Plugin[] = [
  { id: 'dur', name: 'DUR', description: '약물 상호작용 검사', enabled: true },
  { id: 'medication-guide', name: '복약지도', description: '복용 안내문 생성', enabled: false },
]

beforeEach(() => {
  usePluginStore.setState({ plugins: [] })
})

describe('pluginStore', () => {
  describe('setPlugins', () => {
    it('plugins 배열을 교체한다', () => {
      usePluginStore.getState().setPlugins(mockPlugins)

      expect(usePluginStore.getState().plugins).toHaveLength(2)
      expect(usePluginStore.getState().plugins[0].id).toBe('dur')
    })
  })

  describe('togglePlugin', () => {
    it('대상 plugin의 enabled 상태를 변경한다', () => {
      usePluginStore.getState().setPlugins(mockPlugins)
      usePluginStore.getState().togglePlugin('dur', false)

      const dur = usePluginStore.getState().plugins.find((p) => p.id === 'dur')
      expect(dur?.enabled).toBe(false)
    })

    it('다른 plugin의 상태는 변경하지 않는다', () => {
      usePluginStore.getState().setPlugins(mockPlugins)
      usePluginStore.getState().togglePlugin('dur', false)

      const mg = usePluginStore.getState().plugins.find((p) => p.id === 'medication-guide')
      expect(mg?.enabled).toBe(false)
    })

    it('비활성화된 plugin을 활성화할 수 있다', () => {
      usePluginStore.getState().setPlugins(mockPlugins)
      usePluginStore.getState().togglePlugin('medication-guide', true)

      const mg = usePluginStore.getState().plugins.find((p) => p.id === 'medication-guide')
      expect(mg?.enabled).toBe(true)
    })
  })

  describe('isEnabled', () => {
    it('활성화된 plugin에 대해 true를 반환한다', () => {
      usePluginStore.getState().setPlugins(mockPlugins)

      expect(usePluginStore.getState().isEnabled('dur')).toBe(true)
    })

    it('비활성화된 plugin에 대해 false를 반환한다', () => {
      usePluginStore.getState().setPlugins(mockPlugins)

      expect(usePluginStore.getState().isEnabled('medication-guide')).toBe(false)
    })

    it('존재하지 않는 plugin id에 대해 false를 반환한다', () => {
      usePluginStore.getState().setPlugins(mockPlugins)

      expect(usePluginStore.getState().isEnabled('unknown-plugin')).toBe(false)
    })
  })
})
