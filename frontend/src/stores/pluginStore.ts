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
