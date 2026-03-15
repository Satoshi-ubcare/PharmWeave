/**
 * [전역 상태 — Zustand]
 * 다크/라이트 테마는 앱 전체에 영향하며 localStorage에 영구 저장.
 * html 클래스 직접 조작이 필요하므로 훅보다 store에서 관리.
 */
import { create } from 'zustand'

type Theme = 'light' | 'dark'

interface ThemeState {
  theme: Theme
  toggle: () => void
}

function applyTheme(theme: Theme): void {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
  localStorage.setItem('theme', theme)
}

const savedTheme = (localStorage.getItem('theme') as Theme) ?? 'light'
applyTheme(savedTheme)

export const useThemeStore = create<ThemeState>((set) => ({
  theme: savedTheme,
  toggle: () =>
    set((s) => {
      const next: Theme = s.theme === 'light' ? 'dark' : 'light'
      applyTheme(next)
      return { theme: next }
    }),
}))
