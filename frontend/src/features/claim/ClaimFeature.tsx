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
      <div className="flex flex-col items-center justify-center py-24 space-y-6 text-center">
        <style>{`
          @keyframes circleStroke {
            from { stroke-dashoffset: 176; }
            to   { stroke-dashoffset: 0; }
          }
          @keyframes checkDraw {
            from { stroke-dashoffset: 60; }
            to   { stroke-dashoffset: 0; }
          }
          @keyframes completeFadeIn {
            from { opacity: 0; transform: scale(0.85); }
            to   { opacity: 1; transform: scale(1); }
          }
        `}</style>
        {/* Animated success mark */}
        <div style={{ animation: 'completeFadeIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both' }}>
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <circle
              cx="32" cy="32" r="28"
              stroke="#246AFE" strokeWidth="2.5"
              strokeDasharray="176" strokeDashoffset="0"
              transform="rotate(-90 32 32)"
              style={{ animation: 'circleStroke 0.6s ease-out both' }}
            />
            <polyline
              points="20,33 28,41 44,23"
              stroke="#246AFE" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              strokeDasharray="60" strokeDashoffset="0"
              style={{ animation: 'checkDraw 0.4s ease-out 0.5s both' }}
            />
          </svg>
        </div>
        <div className="space-y-1.5">
          <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-blue-600 dark:text-blue-400">
            완료
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">업무 완료</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-500">
            <span className="text-zinc-700 dark:text-zinc-300 font-medium">{patient?.name}</span>님의 방문 처리가 완료되었습니다.
          </p>
        </div>
        <button
          onClick={handleNewVisit}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#246AFE] hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          새 환자 접수
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-blue-600 dark:text-blue-400">
          Step 06
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">청구</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-500">대기 환자를 선택하면 청구를 진행할 수 있습니다.</p>
      </div>

      <StagePatientList stage="claim" />

      {!visitId && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 text-center text-zinc-400 dark:text-zinc-600 text-sm">
          위 목록에서 청구할 환자를 선택하세요.
        </div>
      )}

      {visitId && !claim && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-10 text-center space-y-5">
          <div className="w-12 h-12 border border-zinc-200 dark:border-zinc-800 rounded-xl mx-auto flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
              className="text-zinc-400 dark:text-zinc-600">
              <path d="M14,2 L6,2 C4.89,2 4,2.9 4,4 L4,20 C4,21.1 4.89,22 6,22 L18,22 C19.1,22 20,21.1 20,20 L20,8 L14,2 Z" />
              <polyline points="14,2 14,8 20,8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10,9 9,9 8,9" />
            </svg>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">청구 데이터 생성</p>
            <p className="text-xs text-zinc-400 dark:text-zinc-600">
              처방 및 수납 데이터를 기반으로 건강보험 청구 데이터를 생성합니다.
            </p>
          </div>
          <button
            onClick={handleCreateClaim}
            disabled={claiming}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#246AFE] hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-40"
          >
            {claiming && <Spinner size="sm" className="text-white" />}
            {claiming ? '생성 중' : '청구 데이터 생성'}
          </button>
        </div>
      )}

      {visitId && claim && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-blue-600 dark:text-blue-400">
                청구 데이터
              </p>
              <span className="text-[10px] font-medium tracking-wide px-2 py-0.5 border border-blue-500/30 text-blue-600 dark:text-blue-400 rounded-lg">
                {claim.claim_status}
              </span>
            </div>
            <div className="bg-blue-500/5 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-xl p-4 overflow-auto">
              <pre className="text-xs text-zinc-600 dark:text-zinc-400 font-mono leading-relaxed">
                {JSON.stringify(claim.claim_data, null, 2)}
              </pre>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleComplete}
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#246AFE] hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-40"
            >
              {submitting && <Spinner size="sm" className="text-white" />}
              {submitting ? '처리 중' : '청구 완료 — 업무 종료'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
