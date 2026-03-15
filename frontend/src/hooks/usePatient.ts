import { useState, useCallback } from 'react'
import { patientApi } from '@/api/endpoints'
import type { Patient } from '@/types'

export function usePatientSearch() {
  const [results, setResults] = useState<Patient[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const search = useCallback(async (query: string): Promise<void> => {
    if (!query.trim().length) return
    setLoading(true)
    setError('')
    try {
      const res = await patientApi.search(query)
      setResults(res.data)
    } catch {
      setError('환자 검색에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }, [])

  const clear = useCallback((): void => setResults([]), [])

  return { results, loading, error, search, clear }
}

export function usePatientCreate() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const create = async (data: {
    name: string
    birth_date: string
    phone?: string
  }): Promise<Patient | null> => {
    setLoading(true)
    setError('')
    try {
      const res = await patientApi.create(data)
      return res.data
    } catch {
      setError('환자 등록에 실패했습니다.')
      return null
    } finally {
      setLoading(false)
    }
  }

  return { loading, error, create }
}
