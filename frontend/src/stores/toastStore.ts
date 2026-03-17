/**
 * [전역 상태 — Zustand]
 * 알림 Toast는 어느 컴포넌트에서든 발생 가능하고 WorkflowLayout 최상단에서 렌더링.
 * - success: 3초 후 자동 제거
 * - info:    4초 후 자동 제거
 * - error:   자동 제거 없음 — 수동 닫기 필요
 */
import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'info'

const AUTO_DISMISS_MS: Record<ToastType, number | null> = {
  success: 3000,
  info: 4000,
  error: null,
}

interface ToastItem {
  id: string
  type: ToastType
  message: string
}

interface ToastStore {
  toasts: ToastItem[]
  addToast: (type: ToastType, message: string) => void
  removeToast: (id: string) => void
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (type, message) => {
    const id = Math.random().toString(36).slice(2)
    set((state) => ({ toasts: [...state.toasts, { id, type, message }] }))
    const delay = AUTO_DISMISS_MS[type]
    if (delay !== null) {
      setTimeout(() => {
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
      }, delay)
    }
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}))
