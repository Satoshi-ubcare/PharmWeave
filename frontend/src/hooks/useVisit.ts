import { useState, useEffect, useCallback } from 'react'
import { visitApi } from '@/api/endpoints'
import { extractApiError } from '@/lib/apiError'
import type { Visit, WorkflowStage } from '@/types'

export function useVisitsByStage(stage: WorkflowStage) {
  const [visits, setVisits] = useState<Visit[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await visitApi.today(stage)
      setVisits(res.data)
    } catch (err) {
      setError(extractApiError(err, '대기 목록을 불러오지 못했습니다.'))
    } finally {
      setLoading(false)
    }
  }, [stage])

  useEffect(() => { load() }, [load])

  return { visits, loading, error, refresh: load }
}

export function useVisitCreate() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const create = async (patientId: string): Promise<Visit | null> => {
    setLoading(true)
    setError('')
    try {
      const res = await visitApi.create(patientId)
      return res.data
    } catch (err) {
      setError(extractApiError(err, '방문 생성에 실패했습니다.'))
      return null
    } finally {
      setLoading(false)
    }
  }

  return { loading, error, create }
}

export function useWorkflowStage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const transition = async (visitId: string, stage: WorkflowStage): Promise<Visit | null> => {
    setLoading(true)
    setError('')
    try {
      const res = await visitApi.transitionStage(visitId, stage)
      return res.data
    } catch (err) {
      setError(extractApiError(err, `${stage} 단계 전환에 실패했습니다.`))
      return null
    } finally {
      setLoading(false)
    }
  }

  return { loading, error, transition }
}
