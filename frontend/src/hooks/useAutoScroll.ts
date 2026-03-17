import { useRef, useEffect, useCallback, RefObject } from 'react'

/**
 * 항목 수가 threshold 초과 시 컨테이너를 자동 롤링
 * - 호버/포커스 중 일시정지
 * - 하단 도달 시 맨 위로 부드럽게 복귀
 *
 * @param itemCount  현재 목록 항목 수
 * @param threshold  자동 롤링이 시작되는 최소 항목 수
 * @param speed      스크롤 속도 (px/frame, 기본 0.4)
 */
export function useAutoScroll<T extends HTMLElement>(
  itemCount: number,
  threshold: number,
  speed = 0.4,
): {
  ref: RefObject<T>
  onMouseEnter: () => void
  onMouseLeave: () => void
} {
  const ref = useRef<T>(null)
  const pausedRef = useRef(false)
  const animRef = useRef<number>(0)
  const posRef = useRef(0)

  const onMouseEnter = useCallback(() => { pausedRef.current = true }, [])
  const onMouseLeave = useCallback(() => { pausedRef.current = false }, [])

  useEffect(() => {
    if (itemCount <= threshold) return

    const el = ref.current
    if (!el) return

    // 사용자가 직접 스크롤하면 내부 pos를 동기화
    const syncPos = () => { posRef.current = el.scrollTop }
    el.addEventListener('scroll', syncPos, { passive: true })

    const tick = () => {
      if (!pausedRef.current) {
        const maxScroll = el.scrollHeight - el.clientHeight
        if (maxScroll <= 0) {
          animRef.current = requestAnimationFrame(tick)
          return
        }
        posRef.current += speed
        if (posRef.current >= maxScroll) {
          posRef.current = 0  // 맨 위로 순환
        }
        el.scrollTop = posRef.current
      }
      animRef.current = requestAnimationFrame(tick)
    }

    animRef.current = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(animRef.current)
      el.removeEventListener('scroll', syncPos)
    }
  }, [itemCount, threshold, speed])

  return { ref, onMouseEnter, onMouseLeave }
}
