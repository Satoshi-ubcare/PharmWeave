import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { claimApi } from '@/api/endpoints'
import { useWorkflowStore } from '@/stores/workflowStore'
import { useWorkflowStage } from '@/hooks/useVisit'
import { useToast } from '@/hooks/useToast'
import StagePatientList from '@/components/StagePatientList'
import Spinner from '@/components/ui/Spinner'
import type { Claim } from '@/types'

export default function ClaimFeature() {
  const navigate = useNavigate()
  const { visitId, setStage, reset, patient } = useWorkflowStore()
  const { loading: submitting, error: stageError, transition } = useWorkflowStage()
  const { toast } = useToast()
  const [claim, setClaim] = useState<Claim | null>(null)
  const [completed, setCompleted] = useState(false)
  const [claiming, setClaiming] = useState(false)

  useEffect(() => {
    setClaim(null)
    setCompleted(false)
    setClaiming(false)
  }, [visitId])
  useEffect(() => { if (stageError) toast('error', stageError) }, [stageError, toast])

  const handleCreateClaim = async () => {
    if (!visitId) return
    setClaiming(true)
    try {
      const res = await claimApi.create(visitId)
      setClaim(res.data)
      toast('success', '청구 데이터가 생성되었습니다.')
    } catch {
      toast('error', '청구 생성에 실패했습니다.')
    } finally {
      setClaiming(false)
    }
  }

  const handleComplete = async () => {
    if (!visitId) return
    await transition(visitId, 'completed')
    setStage('completed')
    setCompleted(true)
  }

  const handleNewVisit = () => {
    reset()
    navigate('/reception')
  }

  if (completed) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-4xl shadow-lg">
          🎉
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">업무 완료</h1>
        <p className="text-gray-500 dark:text-gray-400">
          <span className="font-semibold text-gray-700 dark:text-gray-300">{patient?.name}</span>님의 방문 처리가 완료되었습니다.
        </p>
        <button
          onClick={handleNewVisit}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-md flex items-center gap-2"
        >
          <span>🏥</span> 새 환자 접수
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <span>📄</span> 청구
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">대기 환자를 선택하면 청구를 진행할 수 있습니다.</p>
      </div>

      <StagePatientList stage="claim" />

      {!visitId && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center text-gray-400 dark:text-gray-500 text-sm shadow-sm">
          위 목록에서 청구할 환자를 선택하세요.
        </div>
      )}

      {visitId && !claim && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center space-y-4 shadow-sm">
          <div className="text-4xl">📋</div>
          <p className="text-gray-600 dark:text-gray-400">처방 및 수납 데이터를 기반으로 청구 데이터를 생성합니다.</p>
          <button
            onClick={handleCreateClaim}
            disabled={claiming}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-md"
          >
            {claiming && <Spinner className="text-white" />}
            {claiming ? '생성 중...' : '📄 청구 데이터 생성'}
          </button>
        </div>
      )}

      {visitId && claim && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <h2 className="font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <span>📊</span> 청구 데이터
            </h2>
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
              <pre className="text-xs text-gray-700 dark:text-gray-300 overflow-auto font-mono">
                {JSON.stringify(claim.claim_data, null, 2)}
              </pre>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">청구 상태:</span>
              <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded text-xs font-medium">
                📋 {claim.claim_status}
              </span>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleComplete}
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors shadow-md"
            >
              {submitting && <Spinner className="text-white" />}
              {submitting ? '처리 중...' : '🎉 청구 완료 — 업무 종료'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
