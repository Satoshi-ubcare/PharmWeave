import { useState, useEffect, useCallback } from 'react'
import { prescriptionApi, drugApi } from '@/api/endpoints'
import type { Prescription, PrescriptionPayload, Drug } from '@/types'

export function usePrescription(visitId: string | null) {
  const [prescription, setPrescription] = useState<Prescription | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!visitId) return
    setLoading(true)
    prescriptionApi
      .get(visitId)
      .then((res) => setPrescription(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [visitId])

  return { prescription, loading }
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

  const search = useCallback(async (query: string): Promise<void> => {
    if (!query.trim()) return
    const res = await drugApi.search(query)
    setResults(res.data)
  }, [])

  const clear = useCallback((): void => setResults([]), [])

  return { results, search, clear }
}
