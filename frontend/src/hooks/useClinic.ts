import { useState, useCallback } from 'react'
import { clinicApi } from '@/api/endpoints'
import { extractApiError } from '@/lib/apiError'
import type { Clinic } from '@/types'

export function useClinicSearch() {
  const [results, setResults] = useState<Clinic[]>([])
  const [loading, setLoading] = useState(false)

  const search = useCallback(async (q: string): Promise<void> => {
    setLoading(true)
    try {
      const res = await clinicApi.search(q)
      setResults(res.data)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  const clear = useCallback(() => setResults([]), [])

  return { results, loading, search, clear }
}

export function useClinicManage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const update = async (
    id: string,
    data: { phone?: string | null; address?: string | null },
  ): Promise<Clinic | null> => {
    setLoading(true)
    setError('')
    try {
      const res = await clinicApi.update(id, data)
      return res.data
    } catch (err) {
      setError(extractApiError(err, '의료기관 수정에 실패했습니다.'))
      return null
    } finally {
      setLoading(false)
    }
  }

  const remove = async (id: string): Promise<boolean> => {
    setLoading(true)
    setError('')
    try {
      await clinicApi.delete(id)
      return true
    } catch (err) {
      setError(extractApiError(err, '의료기관 삭제에 실패했습니다.'))
      return false
    } finally {
      setLoading(false)
    }
  }

  return { loading, error, update, remove }
}
