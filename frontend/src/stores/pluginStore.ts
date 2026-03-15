/**
 * [전역 상태 — Zustand]
 * Plugin 활성화 여부는 헤더·각 단계 UI(PluginSlot) 모두에서 참조하므로 전역 관리.
 * Plugin 목록 로딩/에러는 usePluginList 훅이 로컬에서 처리.
 */
import { create } from 'zustand'
import type { Plugin } from '@/types'

interface PluginState {
  plugins: Plugin[]
  setPlugins: (plugins: Plugin[]) => void
  togglePlugin: (id: string, enabled: boolean) => void
  isEnabled: (id: string) => boolean
}

export const usePluginStore = create<PluginState>((set, get) => ({
  plugins: [],

  setPlugins: (plugins) => set({ plugins }),

  togglePlugin: (id, enabled) =>
    set((state) => ({
      plugins: state.plugins.map((p) =>
        p.id === id ? { ...p, enabled } : p,
      ),
    })),

  isEnabled: (id) => {
    const plugin = get().plugins.find((p) => p.id === id)
    return plugin?.enabled ?? false
  },
}))
