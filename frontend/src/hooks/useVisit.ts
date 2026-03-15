import { useState } from 'react'
import { visitApi } from '@/api/endpoints'
import type { Visit, WorkflowStage } from '@/types'

export function useVisitCreate() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const create = async (patientId: string): Promise<Visit | null> => {
    setLoading(true)
    setError('')
    try {
      const res = await visitApi.create(patientId)
      return res.data
    } catch {
      setError('방문 생성에 실패했습니다.')
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
    } catch {
      setError(`${stage} 단계 전환에 실패했습니다.`)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { loading, error, transition }
}
