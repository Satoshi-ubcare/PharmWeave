import { useState } from 'react'
import { useWorkflowStore } from '@/stores/workflowStore'
import { useVisitsByStage } from '@/hooks/useVisit'
import Spinner from '@/components/ui/Spinner'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import type { WorkflowStage } from '@/types'

interface Props {
  stage: WorkflowStage
  onSelect?: () => void
}

const STAGE_LABEL: Record<string, string> = {
  prescription: '처방',
  dispensing: '조제',
  review: '검토',
  payment: '수납',
  claim: '청구',
}

const STAGE_EMOJI: Record<string, string> = {
  prescription: '📋',
  dispensing: '💊',
  review: '🔬',
  payment: '💳',
  claim: '📄',
}

export default function StagePatientList({ stage, onSelect }: Props) {
  const { visitId, patient: currentPatient, setVisit } = useWorkflowStore()
  const { visits, loading, error, refresh } = useVisitsByStage(stage)
  const [pendingVisit, setPendingVisit] = useState<(typeof visits)[number] | null>(null)

  const handleSelect = (v: (typeof visits)[number]) => {
    if (!v.patient) return
    // 다른 환자가 이미 진행 중인 경우 확인 다이얼로그 표시
    if (visitId && visitId !== v.id) {
      setPendingVisit(v)
      return
    }
    setVisit(v, v.patient)
    onSelect?.()
  }

  const handleConfirmSwitch = () => {
    if (!pendingVisit?.patient) return
    setVisit(pendingVisit, pendingVisit.patient)
    setPendingVisit(null)
    onSelect?.()
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
          <span>{STAGE_EMOJI[stage]}</span>
          <span>{STAGE_LABEL[stage]} 대기 환자</span>
          {!loading && (
            <span className="ml-1 text-xs font-normal text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded-full">
              {visits.length}명
            </span>
          )}
        </h2>
        <button
          onClick={refresh}
          className="text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 transition-colors"
        >
          <span>🔄</span>
          <span>새로고침</span>
        </button>
      </div>

      {loading && (
        <p className="text-xs text-gray-400 dark:text-gray-500 py-2 flex items-center gap-1.5">
          <Spinner size="sm" className="text-gray-400" />
          <span>불러오는 중...</span>
        </p>
      )}

      {!loading && error && (
        <p className="text-xs text-red-400 dark:text-red-500 py-2">⚠️ {error}</p>
      )}

      {!loading && !error && visits.length === 0 && (
        <p className="text-xs text-gray-400 dark:text-gray-500 py-2">대기 환자 없음</p>
      )}

      {!loading && visits.length > 0 && (
        <ul className="space-y-1">
          {visits.map((v) => (
            <li key={v.id}>
              <button
                onClick={() => handleSelect(v)}
                className={[
                  'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                  v.id === visitId
                    ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 text-blue-900 dark:text-blue-300'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200',
                ].join(' ')}
              >
                <span className="font-medium">{v.patient?.name ?? '—'}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">
                  {new Date(v.visited_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                </span>
                {v.id === visitId && (
                  <span className="ml-2 text-xs text-blue-500 dark:text-blue-400">▶ 진행 중</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={pendingVisit !== null}
        title="환자 전환"
        description={`${currentPatient?.name ?? '현재 환자'}의 작업이 진행 중입니다. ${pendingVisit?.patient?.name ?? '선택한 환자'}로 전환하면 현재 입력 내용이 초기화됩니다. 계속하시겠습니까?`}
        confirmLabel="전환"
        cancelLabel="유지"
        variant="danger"
        onConfirm={handleConfirmSwitch}
        onCancel={() => setPendingVisit(null)}
      />
    </div>
  )
}
