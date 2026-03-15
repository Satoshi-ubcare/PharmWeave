import { useState, useEffect, useCallback } from 'react'
import { prescriptionApi, drugApi } from '@/api/endpoints'
import type { Prescription, PrescriptionPayload, Drug } from '@/types'

export function usePrescription(visitId: string | null) {
  const [prescription, setPrescription] = useState<Prescription | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!visitId) return
    setLoading(true)
    setError('')
    prescriptionApi
      .get(visitId)
      .then((res) => setPrescription(res.data))
      .catch(() => setError('처방 정보를 불러오지 못했습니다.'))
      .finally(() => setLoading(false))
  }, [visitId])

  return { prescription, loading, error }
}

export function usePrescriptionSave() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const save = async (visitId: string, data: PrescriptionPayload): Promise<Prescription | null> => {
    setLoading(true)
    setError('')
    try {
      const res = await prescriptionApi.create(visitId, data)
      return res.data
    } catch {
      setError('처방 저장에 실패했습니다.')
      return null
    } finally {
      setLoading(false)
    }
  }

  return { loading, error, save }
}

export function useDrugSearch() {
  const [results, setResults] = useState<Drug[]>([])
  const [loading, setLoading] = useState(false)

  const search = useCallback(async (query: string): Promise<void> => {
    if (!query.trim()) return
    setLoading(true)
    try {
      const res = await drugApi.search(query)
      setResults(res.data)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  const clear = useCallback((): void => setResults([]), [])

  return { results, loading, search, clear }
}
