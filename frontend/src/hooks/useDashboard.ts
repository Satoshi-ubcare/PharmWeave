import { useState, useEffect, useCallback, useRef } from 'react'
import { statsApi } from '@/api/endpoints'
import type { DashboardStats } from '@/types'

const REFRESH_INTERVAL_MS = 30_000

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetch = useCallback(async () => {
    try {
      const res = await statsApi.today()
      setStats(res.data)
      setLastUpdated(new Date())
      setError(null)
    } catch {
      setError('통계 데이터를 불러올 수 없습니다.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch()
    timerRef.current = setInterval(fetch, REFRESH_INTERVAL_MS)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [fetch])

  return { stats, loading, error, lastUpdated, refresh: fetch }
}
