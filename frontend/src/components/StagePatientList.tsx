import { useWorkflowStore } from '@/stores/workflowStore'
import { useVisitsByStage } from '@/hooks/useVisit'
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
  const { visitId, setVisit } = useWorkflowStore()
  const { visits, loading, refresh } = useVisitsByStage(stage)

  const handleSelect = (v: (typeof visits)[number]) => {
    if (!v.patient) return
    setVisit(v, v.patient)
    onSelect?.()
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-700">
          {STAGE_LABEL[stage]} 대기 환자
          {!loading && (
            <span className="ml-2 text-xs font-normal text-gray-400">({visits.length}명)</span>
          )}
        </h2>
        <button
          onClick={refresh}
          className="text-xs text-blue-500 hover:text-blue-700"
        >
          새로고침
        </button>
      </div>

      {loading && <p className="text-xs text-gray-400 py-2">불러오는 중...</p>}

      {!loading && visits.length === 0 && (
        <p className="text-xs text-gray-400 py-2">대기 환자 없음</p>
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
                    ? 'bg-blue-50 border border-blue-200 text-blue-900'
                    : 'hover:bg-gray-50 text-gray-800',
                ].join(' ')}
              >
                <span className="font-medium">{v.patient?.name ?? '—'}</span>
                <span className="text-xs text-gray-400 ml-2">
                  {new Date(v.visited_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                </span>
                {v.id === visitId && (
                  <span className="ml-2 text-xs text-blue-500">진행 중</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
