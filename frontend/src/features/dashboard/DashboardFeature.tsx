import { useNavigate } from 'react-router-dom'
import { useDashboardStats } from '@/hooks/useDashboard'
import { useWorkflowStore } from '@/stores/workflowStore'
import Spinner from '@/components/ui/Spinner'
import type { WorkflowStage } from '@/types'

// ─── Stage 메타 ───────────────────────────────────────────
const STAGE_META: Array<{
  stage: WorkflowStage
  label: string
  path: string
}> = [
  { stage: 'reception',    label: '접수',  path: '/reception' },
  { stage: 'prescription', label: '처방',  path: '/prescription' },
  { stage: 'dispensing',   label: '조제',  path: '/dispensing' },
  { stage: 'review',       label: '검토',  path: '/review' },
  { stage: 'payment',      label: '수납',  path: '/payment' },
  { stage: 'claim',        label: '청구',  path: '/claim' },
  { stage: 'completed',    label: '완료',  path: '/reception' },
]

const STAGE_LABEL: Record<WorkflowStage, string> = {
  reception:    '접수',
  prescription: '처방',
  dispensing:   '조제',
  review:       '검토',
  payment:      '수납',
  claim:        '청구',
  completed:    '완료',
}

// ─── 서브 컴포넌트: KPI 카드 ──────────────────────────────
interface KpiCardProps {
  label: string
  value: string | number
  sub?: string
  highlight?: boolean
}

function KpiCard({ label, value, sub, highlight }: KpiCardProps) {
  return (
    <div className={[
      'bg-white dark:bg-zinc-900 border rounded-xl p-5 space-y-2',
      highlight
        ? 'border-blue-500/40 dark:border-blue-500/30'
        : 'border-zinc-200 dark:border-zinc-800',
    ].join(' ')}>
      <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-blue-600 dark:text-blue-400">
        {label}
      </p>
      <p className={[
        'text-3xl font-bold tracking-tight',
        highlight
          ? 'text-blue-600 dark:text-blue-400'
          : 'text-zinc-900 dark:text-zinc-100',
      ].join(' ')}>
        {value}
      </p>
      {sub && (
        <p className="text-xs text-zinc-400 dark:text-zinc-600">{sub}</p>
      )}
    </div>
  )
}

// ─── 서브 컴포넌트: 단계 뱃지 ────────────────────────────
function StageBadge({ stage }: { stage: WorkflowStage }) {
  const colors: Record<WorkflowStage, string> = {
    reception:    'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400',
    prescription: 'bg-blue-50  dark:bg-blue-950/40 text-blue-600 dark:text-blue-400',
    dispensing:   'bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400',
    review:       'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400',
    payment:      'bg-blue-50  dark:bg-blue-950/40 text-blue-600 dark:text-blue-400',
    claim:        'bg-rose-50   dark:bg-rose-950/40 text-rose-600 dark:text-rose-400',
    completed:    'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
  }
  return (
    <span className={`text-[10px] font-semibold tracking-wide px-2 py-0.5 rounded-lg ${colors[stage]}`}>
      {STAGE_LABEL[stage]}
    </span>
  )
}

// ─── 메인 컴포넌트 ────────────────────────────────────────
export default function DashboardFeature() {
  const navigate = useNavigate()
  const { setVisit } = useWorkflowStore()
  const { stats, loading, error, lastUpdated, refresh } = useDashboardStats()

  const handleVisitClick = (visit: { id: string; patient: { name: string; birth_date: string }; workflow_stage: WorkflowStage; visited_at: string }) => {
    const stageMeta = STAGE_META.find((s) => s.stage === visit.workflow_stage)
    if (!stageMeta) return
    setVisit(
      {
        id: visit.id,
        patient_id: '',
        workflow_stage: visit.workflow_stage,
        visited_at: visit.visited_at,
        created_at: visit.visited_at,
        updated_at: visit.visited_at,
      },
      {
        id: '',
        name: visit.patient.name,
        birth_date: visit.patient.birth_date,
        phone: null,
        gender: null,
        allergies: null,
        insurance_type: 'health_insurance' as const,
        copay_exemption: 'none' as const,
        created_at: visit.visited_at,
      },
    )
    navigate(stageMeta.path)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 gap-3 text-zinc-400 dark:text-zinc-600">
        <Spinner size="md" className="text-zinc-400" />
        <span className="text-sm">데이터 불러오는 중...</span>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="py-20 text-center space-y-3">
        <p className="text-sm text-red-400">{error ?? '알 수 없는 오류가 발생했습니다.'}</p>
        <button onClick={refresh} className="text-xs text-blue-600 underline underline-offset-2">
          다시 시도
        </button>
      </div>
    )
  }

  // 단계별 파이프라인 (completed 제외한 진행 단계만)
  const pipelineStages = STAGE_META.filter((s) => s.stage !== 'completed')
  const maxCount = Math.max(1, ...pipelineStages.map((s) => stats.byStage[s.stage] ?? 0))

  return (
    <div className="space-y-8">
      {/* 페이지 헤딩 */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-blue-600 dark:text-blue-400">
            Today
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            대시보드
          </h1>
          {lastUpdated && (
            <p className="text-xs text-zinc-400 dark:text-zinc-600">
              마지막 업데이트: {lastUpdated.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              <span className="ml-1 text-zinc-300 dark:text-zinc-700">· 30초마다 자동 갱신</span>
            </p>
          )}
        </div>
        <button
          onClick={refresh}
          className="flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-600 hover:text-blue-600 dark:hover:text-blue-400 transition-colors border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 rounded-xl"
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="23,4 23,10 17,10" />
            <path d="M20.49,15a9,9,0,1,1-2.12-9.36L23,10" />
          </svg>
          새로고침
        </button>
      </div>

      {/* KPI 카드 4개 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          label="오늘 총 방문"
          value={stats.totalVisits}
          sub="접수 이후 전체"
        />
        <KpiCard
          label="진행 중"
          value={stats.activeVisits}
          sub="완료 전 모든 단계"
        />
        <KpiCard
          label="처리 완료"
          value={stats.completedVisits}
          sub={`완료율 ${stats.totalVisits > 0 ? Math.round((stats.completedVisits / stats.totalVisits) * 100) : 0}%`}
        />
        <KpiCard
          label="오늘 수납 합계"
          value={`${stats.totalRevenue.toLocaleString()}원`}
          sub="본인부담금 기준"
          highlight
        />
      </div>

      {/* 단계별 파이프라인 */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 space-y-5">
        <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-blue-600 dark:text-blue-400">
          단계별 대기 현황
        </p>
        <div className="space-y-3">
          {pipelineStages.map(({ stage, label, path }) => {
            const count = stats.byStage[stage] ?? 0
            const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0
            return (
              <button
                key={stage}
                onClick={() => navigate(path)}
                className="w-full group text-left"
              >
                <div className="flex items-center gap-3 mb-1.5">
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-500 w-8 text-right flex-shrink-0">
                    {count}
                  </span>
                  <span className="text-xs text-zinc-400 dark:text-zinc-600 w-14 flex-shrink-0 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {label}
                  </span>
                  <div className="flex-1 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={[
                        'h-full rounded-full transition-all duration-500',
                        count > 0 ? 'bg-[#246AFE]' : 'bg-zinc-200 dark:bg-zinc-700',
                      ].join(' ')}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                  <svg
                    width="12" height="12" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2"
                    className="text-zinc-300 dark:text-zinc-700 group-hover:text-blue-500 transition-colors flex-shrink-0"
                  >
                    <polyline points="9,18 15,12 9,6" />
                  </svg>
                </div>
              </button>
            )
          })}
        </div>
        {/* 완료 */}
        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <span className="text-[10px] font-semibold tracking-[0.12em] uppercase text-emerald-500 dark:text-emerald-400">
            완료
          </span>
          <span className="text-sm font-semibold text-emerald-500 dark:text-emerald-400">
            {stats.completedVisits}건
          </span>
        </div>
      </div>

      {/* 최근 방문 목록 */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-blue-600 dark:text-blue-400">
            오늘 방문 목록
          </p>
          <span className="text-[10px] text-zinc-400 dark:text-zinc-600">
            최근 15건
          </span>
        </div>

        {stats.recentVisits.length === 0 ? (
          <p className="text-sm text-zinc-400 dark:text-zinc-600 py-6 text-center">
            오늘 방문 내역이 없습니다.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] tracking-[0.1em] uppercase text-zinc-400 dark:text-zinc-600 border-b border-zinc-100 dark:border-zinc-800">
                  <th className="text-left pb-3 font-medium">환자명</th>
                  <th className="text-left pb-3 font-medium">생년월일</th>
                  <th className="text-center pb-3 font-medium">단계</th>
                  <th className="text-center pb-3 font-medium">접수 시각</th>
                  <th className="text-right pb-3 font-medium">본인부담금</th>
                  <th className="w-6" />
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                {stats.recentVisits.map((visit) => (
                  <tr
                    key={visit.id}
                    onClick={() => handleVisitClick(visit)}
                    className="cursor-pointer hover:bg-blue-50/50 dark:hover:bg-zinc-800/50 transition-colors group"
                  >
                    <td className="py-3 font-medium text-zinc-900 dark:text-zinc-100">
                      {visit.patient.name}
                    </td>
                    <td className="py-3 text-zinc-400 dark:text-zinc-600 text-xs">
                      {String(visit.patient.birth_date).slice(0, 10)}
                    </td>
                    <td className="py-3 text-center">
                      <StageBadge stage={visit.workflow_stage} />
                    </td>
                    <td className="py-3 text-center text-xs text-zinc-400 dark:text-zinc-600">
                      {new Date(visit.visited_at).toLocaleTimeString('ko-KR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 text-right text-xs font-medium">
                      {visit.copay_amount !== null
                        ? <span className="text-blue-700 dark:text-blue-400">{visit.copay_amount.toLocaleString()}원</span>
                        : <span className="text-zinc-300 dark:text-zinc-700">—</span>
                      }
                    </td>
                    <td className="py-3 text-center">
                      <svg
                        width="12" height="12" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2"
                        className="text-zinc-200 dark:text-zinc-700 group-hover:text-blue-500 transition-colors mx-auto"
                      >
                        <polyline points="9,18 15,12 9,6" />
                      </svg>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
