import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useToastStore } from '../toastStore'

beforeEach(() => {
  useToastStore.setState({ toasts: [] })
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('toastStore', () => {
  describe('addToast', () => {
    it('toast를 추가한다', () => {
      useToastStore.getState().addToast('success', '저장되었습니다.')

      const { toasts } = useToastStore.getState()
      expect(toasts).toHaveLength(1)
      expect(toasts[0].type).toBe('success')
      expect(toasts[0].message).toBe('저장되었습니다.')
    })

    it('여러 toast를 동시에 보유할 수 있다', () => {
      useToastStore.getState().addToast('success', '첫 번째')
      useToastStore.getState().addToast('error', '두 번째')

      expect(useToastStore.getState().toasts).toHaveLength(2)
    })

    it('각 toast에 고유한 id가 부여된다', () => {
      useToastStore.getState().addToast('info', 'A')
      useToastStore.getState().addToast('info', 'B')

      const { toasts } = useToastStore.getState()
      expect(toasts[0].id).not.toBe(toasts[1].id)
    })

    it('success는 3초 후 자동으로 제거된다', () => {
      useToastStore.getState().addToast('success', '자동 제거 테스트')
      expect(useToastStore.getState().toasts).toHaveLength(1)

      vi.advanceTimersByTime(3000)
      expect(useToastStore.getState().toasts).toHaveLength(0)
    })

    it('info는 4초 후 자동으로 제거된다', () => {
      useToastStore.getState().addToast('info', '자동 제거 테스트')
      expect(useToastStore.getState().toasts).toHaveLength(1)

      vi.advanceTimersByTime(4000)
      expect(useToastStore.getState().toasts).toHaveLength(0)
    })

    it('error는 시간이 지나도 자동으로 제거되지 않는다', () => {
      useToastStore.getState().addToast('error', '수동 닫기 필요')

      vi.advanceTimersByTime(10000)
      expect(useToastStore.getState().toasts).toHaveLength(1)
    })
  })

  describe('removeToast', () => {
    it('id로 특정 toast를 제거한다', () => {
      useToastStore.getState().addToast('error', '제거 대상')
      const { toasts } = useToastStore.getState()
      const id = toasts[0].id

      useToastStore.getState().removeToast(id)
      expect(useToastStore.getState().toasts).toHaveLength(0)
    })

    it('다른 toast는 남긴다', () => {
      useToastStore.getState().addToast('success', '유지')
      useToastStore.getState().addToast('error', '제거')
      const { toasts } = useToastStore.getState()
      const removeId = toasts[1].id

      useToastStore.getState().removeToast(removeId)

      const remaining = useToastStore.getState().toasts
      expect(remaining).toHaveLength(1)
      expect(remaining[0].message).toBe('유지')
    })

    it('존재하지 않는 id 제거 시 오류 없이 처리된다', () => {
      useToastStore.getState().addToast('info', '테스트')

      expect(() => useToastStore.getState().removeToast('non-existent-id')).not.toThrow()
      expect(useToastStore.getState().toasts).toHaveLength(1)
    })
  })
})
