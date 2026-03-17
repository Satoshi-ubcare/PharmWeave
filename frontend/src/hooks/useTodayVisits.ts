import { useState, useEffect, useCallback } from 'react'
import { visitApi } from '@/api/endpoints'
import { extractApiError } from '@/lib/apiError'
import type { Visit } from '@/types'

/** 오늘의 전체 방문 목록 (stage 필터 없음) */
export function useTodayVisits() {
  const [visits, setVisits] = useState<Visit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await visitApi.today()
      setVisits(res.data)
    } catch (err) {
      setError(extractApiError(err, '방문 데이터를 불러올 수 없습니다.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return { visits, loading, error, refresh: load }
}
