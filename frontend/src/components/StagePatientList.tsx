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

export default function StagePatientList({ stage, onSelect }: Props) {
  const { visitId, patient: currentPatient, setVisit } = useWorkflowStore()
  const { visits, loading, error, refresh } = useVisitsByStage(stage)
  const [pendingVisit, setPendingVisit] = useState<(typeof visits)[number] | null>(null)

  const handleSelect = (v: (typeof visits)[number]) => {
    if (!v.patient) return
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
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-amber-500 dark:text-amber-400">
            {STAGE_LABEL[stage]} 대기
          </span>
          {!loading && (
            <span className="text-[10px] text-zinc-400 dark:text-zinc-600 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-sm">
              {visits.length}명
            </span>
          )}
        </div>
        <button
          onClick={refresh}
          className="text-[10px] text-zinc-400 dark:text-zinc-600 hover:text-amber-500 dark:hover:text-amber-400 transition-colors tracking-wide uppercase"
        >
          새로고침
        </button>
      </div>

      {loading && (
        <div className="flex items-center gap-2 py-2">
          <Spinner size="sm" className="text-zinc-400" />
          <span className="text-xs text-zinc-400 dark:text-zinc-600">불러오는 중...</span>
        </div>
      )}

      {!loading && error && (
        <p className="text-xs text-red-400 py-2">{error}</p>
      )}

      {!loading && !error && visits.length === 0 && (
        <p className="text-xs text-zinc-400 dark:text-zinc-600 py-2">대기 환자 없음</p>
      )}

      {!loading && visits.length > 0 && (
        <ul className="space-y-1">
          {visits.map((v) => (
            <li key={v.id}>
              <button
                onClick={() => handleSelect(v)}
                className={[
                  'w-full text-left px-3 py-2 rounded text-sm transition-colors',
                  v.id === visitId
                    ? 'bg-amber-400/10 border border-amber-400/30 text-amber-600 dark:text-amber-300'
                    : 'hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-transparent',
                ].join(' ')}
              >
                <span className="font-medium">{v.patient?.name ?? '—'}</span>
                <span className="text-xs text-zinc-400 dark:text-zinc-600 ml-2">
                  {new Date(v.visited_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                </span>
                {v.id === visitId && (
                  <span className="ml-2 text-[10px] text-amber-500 font-medium tracking-wide">진행 중</span>
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
