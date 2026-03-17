import { useState, useCallback } from 'react'
import { patientApi } from '@/api/endpoints'
import { extractApiError } from '@/lib/apiError'
import { matchesKoreanSearch, toApiQuery } from '@/lib/koreanSearch'
import type { Patient, InsuranceType, CopayExemption } from '@/types'

export function usePatientSearch() {
  const [results, setResults] = useState<Patient[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const search = useCallback(async (query: string): Promise<void> => {
    const trimmed = query.trim()
    if (!trimmed) return
    setLoading(true)
    setError('')
    try {
      const apiQ = toApiQuery(trimmed)
      const res = await patientApi.search(apiQ)
      // 초성 포함 로컬 필터 적용
      const filtered = res.data.filter((p) => matchesKoreanSearch(trimmed, p.name))
      setResults(filtered)
    } catch (err) {
      setError(extractApiError(err, '환자 검색에 실패했습니다.'))
    } finally {
      setLoading(false)
    }
  }, [])

  const clear = useCallback((): void => setResults([]), [])

  return { results, loading, error, search, clear }
}

export function usePatientUpdate() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const update = async (
    id: string,
    data: {
      name?: string
      birth_date?: string
      phone?: string | null
      gender?: string | null
      allergies?: string | null
      insurance_type?: InsuranceType
      copay_exemption?: CopayExemption
    },
  ): Promise<Patient | null> => {
    setLoading(true)
    setError('')
    try {
      const res = await patientApi.update(id, data)
      return res.data
    } catch (err) {
      setError(extractApiError(err, '환자 정보 수정에 실패했습니다.'))
      return null
    } finally {
      setLoading(false)
    }
  }

  return { loading, error, update }
}

export function usePatientCreate() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const create = async (data: {
    name: string
    birth_date: string
    phone?: string
    gender?: string
    allergies?: string
    insurance_type?: InsuranceType
    copay_exemption?: CopayExemption
  }): Promise<Patient | null> => {
    setLoading(true)
    setError('')
    try {
      const res = await patientApi.create(data)
      return res.data
    } catch (err) {
      setError(extractApiError(err, '환자 등록에 실패했습니다.'))
      return null
    } finally {
      setLoading(false)
    }
  }

  return { loading, error, create }
}
