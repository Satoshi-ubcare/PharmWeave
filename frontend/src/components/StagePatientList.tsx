import { useState } from 'react'
import { useWorkflowStore } from '@/stores/workflowStore'
import { useVisitsByStage } from '@/hooks/useVisit'
import { useAutoScroll } from '@/hooks/useAutoScroll'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import RefreshButton from '@/components/ui/RefreshButton'
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

const ROLL_THRESHOLD = 5

export default function StagePatientList({ stage, onSelect }: Props) {
  const { visitId, patient: currentPatient, setVisit, reset } = useWorkflowStore()
  const { visits, loading, error, refresh } = useVisitsByStage(stage)
  const [pendingVisit, setPendingVisit] = useState<(typeof visits)[number] | null>(null)
  const scroll = useAutoScroll<HTMLUListElement>(visits.length, ROLL_THRESHOLD)

  const handleSelect = (v: (typeof visits)[number]) => {
    if (!v.patient) return
    // 이미 선택된 환자 클릭 → 선택 해제
    if (v.id === visitId) {
      reset()
      return
    }
    if (visitId) {
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
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-blue-600 dark:text-blue-400">
            {STAGE_LABEL[stage]} 대기
          </span>
          {!loading && (
            <span className="text-[10px] text-zinc-400 dark:text-zinc-600 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-lg">
              {visits.length}명
            </span>
          )}
        </div>
        <RefreshButton onClick={refresh} size="sm" />
      </div>

      {loading && (
        <div className="space-y-1.5 py-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl overflow-hidden">
              <div className="flex-1 space-y-1.5">
                <div
                  className="h-3 rounded-md bg-zinc-200 dark:bg-zinc-800"
                  style={{ width: `${50 + (i * 17) % 35}%`, animation: `shimmer 1.4s ease-in-out ${i * 0.15}s infinite` }}
                />
                <div
                  className="h-2.5 rounded-md bg-zinc-100 dark:bg-zinc-800/60"
                  style={{ width: '30%', animation: `shimmer 1.4s ease-in-out ${i * 0.15 + 0.1}s infinite` }}
                />
              </div>
            </div>
          ))}
          <style>{`
            @keyframes shimmer {
              0%, 100% { opacity: 0.5; }
              50% { opacity: 1; }
            }
          `}</style>
        </div>
      )}

      {!loading && error && (
        <p className="text-xs text-red-400 py-2">{error}</p>
      )}

      {!loading && !error && visits.length === 0 && (
        <p className="text-xs text-zinc-400 dark:text-zinc-600 py-2">대기 환자 없음</p>
      )}

      {!loading && visits.length > 0 && (
        <ul
          ref={scroll.ref}
          onMouseEnter={scroll.onMouseEnter}
          onMouseLeave={scroll.onMouseLeave}
          className="space-y-1 overflow-y-auto max-h-[220px] pr-1"
        >
          {visits.map((v) => (
            <li key={v.id}>
              <button
                onClick={() => handleSelect(v)}
                className={[
                  'w-full text-left px-3 py-2 rounded-xl text-sm transition-colors',
                  v.id === visitId
                    ? 'bg-blue-500/10 border border-blue-500/30 text-blue-700 dark:text-blue-300'
                    : 'hover:bg-blue-50/50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-transparent',
                ].join(' ')}
              >
                <span className="font-medium">{v.patient?.name ?? '—'}</span>
                <span className="text-xs text-zinc-400 dark:text-zinc-600 ml-2">
                  {new Date(v.visited_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                </span>
                {v.id === visitId && (
                  <span className="ml-2 text-[10px] text-blue-600 font-medium tracking-wide">진행 중</span>
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
