import { useNavigate } from 'react-router-dom'
import { useDashboardStats } from '@/hooks/useDashboard'
import { useWorkflowStore } from '@/stores/workflowStore'
import { useAutoScroll } from '@/hooks/useAutoScroll'
import Spinner from '@/components/ui/Spinner'
import RefreshButton from '@/components/ui/RefreshButton'
import DonutChart from '@/components/ui/DonutChart'
import SortableLayout from '@/components/SortableLayout'
import SortableGrid from '@/components/SortableGrid'
import type { WorkflowStage } from '@/types'

// ─── 상수 ──────────────────────────────────────────────────
const STAGE_META: Array<{ stage: WorkflowStage; label: string; path: string }> = [
  { stage: 'reception',    label: '접수',  path: '/reception' },
  { stage: 'prescription', label: '처방',  path: '/prescription' },
  { stage: 'dispensing',   label: '조제',  path: '/dispensing' },
  { stage: 'review',       label: '검토',  path: '/review' },
  { stage: 'payment',      label: '수납',  path: '/payment' },
  { stage: 'claim',        label: '청구',  path: '/claim' },
  { stage: 'completed',    label: '완료',  path: '/reception' },
]

const STAGE_LABEL: Record<WorkflowStage, string> = {
  reception: '접수', prescription: '처방', dispensing: '조제',
  review: '검토', payment: '수납', claim: '청구', completed: '완료',
}

// 단계별 bar 색상 (Tailwind safe-list 포함)
const STAGE_BAR_COLOR: Record<WorkflowStage, string> = {
  reception:    'bg-slate-400',
  prescription: 'bg-blue-500',
  dispensing:   'bg-violet-500',
  review:       'bg-amber-500',
  payment:      'bg-cyan-500',
  claim:        'bg-rose-500',
  completed:    'bg-emerald-500',
}

const STAGE_DOT_COLOR: Record<WorkflowStage, string> = {
  reception:    'bg-slate-400',
  prescription: 'bg-blue-500',
  dispensing:   'bg-violet-500',
  review:       'bg-amber-500',
  payment:      'bg-cyan-500',
  claim:        'bg-rose-500',
  completed:    'bg-emerald-500',
}

// 방문 테이블 뱃지 색상
const STAGE_BADGE_COLOR: Record<WorkflowStage, string> = {
  reception:    'bg-zinc-100    dark:bg-zinc-800       text-zinc-600   dark:text-zinc-400',
  prescription: 'bg-blue-50    dark:bg-blue-950/40    text-blue-600   dark:text-blue-400',
  dispensing:   'bg-violet-50  dark:bg-violet-950/40  text-violet-600 dark:text-violet-400',
  review:       'bg-amber-50   dark:bg-amber-950/40   text-amber-600  dark:text-amber-400',
  payment:      'bg-cyan-50    dark:bg-cyan-950/40    text-cyan-600   dark:text-cyan-400',
  claim:        'bg-rose-50    dark:bg-rose-950/40    text-rose-600   dark:text-rose-400',
  completed:    'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
}

// ─── KPI 카드 ──────────────────────────────────────────────
interface KpiCardProps {
  label: string
  value: string | number
  sub?: string
  icon: JSX.Element
  iconBg: string
  highlight?: boolean
  onClick?: () => void
}

function KpiCard({ label, value, sub, icon, iconBg, highlight = false, onClick }: KpiCardProps): JSX.Element {
  return (
    <div
      onClick={onClick}
      className={[
        'bg-white dark:bg-zinc-900 border rounded-xl p-4 flex items-start gap-3 transition-all duration-150',
        highlight
          ? 'border-blue-500/40 dark:border-blue-500/30'
          : 'border-zinc-200 dark:border-zinc-800',
        onClick
          ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 hover:border-blue-400/60 dark:hover:border-blue-500/40'
          : '',
      ].join(' ')}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-zinc-400 dark:text-zinc-600">
          {label}
        </p>
        <p className={[
          'text-2xl font-bold tracking-tight mt-0.5 leading-none',
          highlight ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-900 dark:text-zinc-100',
        ].join(' ')}>
          {value}
        </p>
        {sub && <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-1">{sub}</p>}
      </div>
      {onClick && (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className="text-zinc-300 dark:text-zinc-700 flex-shrink-0 mt-1 self-start">
          <polyline points="9,18 15,12 9,6" />
        </svg>
      )}
    </div>
  )
}

// ─── 단계 뱃지 ────────────────────────────────────────────
function StageBadge({ stage }: { stage: WorkflowStage }): JSX.Element {
  return (
    <span className={`text-[10px] font-semibold tracking-wide px-2 py-0.5 rounded-lg ${STAGE_BADGE_COLOR[stage]}`}>
      {STAGE_LABEL[stage]}
    </span>
  )
}

// ─── 메인 컴포넌트 ─────────────────────────────────────────
const VISIT_ROLL_THRESHOLD = 8

export default function DashboardFeature(): JSX.Element {
  const navigate = useNavigate()
  const { setVisit } = useWorkflowStore()
  const { stats, loading, error, lastUpdated, refresh } = useDashboardStats()

  const visitCount  = stats?.recentVisits.length ?? 0
  const visitScroll = useAutoScroll<HTMLDivElement>(visitCount, VISIT_ROLL_THRESHOLD, 0.4)

  const handleVisitClick = (visit: {
    id: string
    patient: { name: string; birth_date: string }
    workflow_stage: WorkflowStage
    visited_at: string
  }): void => {
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

  // ── 로딩 ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 gap-3 text-zinc-400 dark:text-zinc-600">
        <Spinner size="md" className="text-zinc-400" />
        <span className="text-sm">데이터 불러오는 중...</span>
      </div>
    )
  }

  // ── 에러 ────────────────────────────────────────────────
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

  const pipelineStages   = STAGE_META.filter((s) => s.stage !== 'completed')
  const maxCount         = Math.max(1, ...pipelineStages.map((s) => stats.byStage[s.stage] ?? 0))
  const completionRate   = stats.totalVisits > 0
    ? Math.round((stats.completedVisits / stats.totalVisits) * 100)
    : 0

  // ── 섹션 정의 ─────────────────────────────────────────
  const kpiSection = (
    <SortableGrid
      pageId="dashboard-kpi"
      defaultOrder={['total', 'active', 'completed', 'revenue']}
      className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      items={{
        total: (
          <KpiCard
            label="오늘 총 방문"
            value={stats.totalVisits}
            sub="접수 이후 전체"
            iconBg="bg-zinc-100 dark:bg-zinc-800"
            onClick={() => navigate('/dashboard/detail?view=total')}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                className="text-zinc-500 dark:text-zinc-400">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            }
          />
        ),
        active: (
          <KpiCard
            label="진행 중"
            value={stats.activeVisits}
            sub="완료 전 모든 단계"
            iconBg="bg-blue-50 dark:bg-blue-950/40"
            onClick={() => navigate('/dashboard/detail?view=active')}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                className="text-blue-500">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12,6 12,12 16,14" />
              </svg>
            }
          />
        ),
        completed: (
          <KpiCard
            label="처리 완료"
            value={stats.completedVisits}
            sub={`완료율 ${completionRate}%`}
            iconBg="bg-emerald-50 dark:bg-emerald-950/40"
            onClick={() => navigate('/dashboard/detail?view=completed')}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                className="text-emerald-500">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22,4 12,14.01 9,11.01" />
              </svg>
            }
          />
        ),
        revenue: (
          <KpiCard
            label="오늘 수납 합계"
            value={`${stats.totalRevenue.toLocaleString()}원`}
            sub="본인부담금 기준"
            highlight
            iconBg="bg-blue-500/10 dark:bg-blue-500/20"
            onClick={() => navigate('/dashboard/detail?view=revenue')}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                className="text-blue-600 dark:text-blue-400">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            }
          />
        ),
      }}
    />
  )

  const chartsSection = (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 items-stretch">

        {/* 처리 현황 도넛 차트 — 2 cols */}
        <div
          onClick={() => navigate('/dashboard/detail?view=status')}
          className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 flex flex-col gap-4 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 hover:border-blue-400/60 dark:hover:border-blue-500/40"
        >
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-blue-600 dark:text-blue-400">
              처리 현황
            </p>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className="text-zinc-300 dark:text-zinc-700">
              <polyline points="9,18 15,12 9,6" />
            </svg>
          </div>
          <div className="flex-1 flex items-center justify-center py-2">
            {stats.totalVisits === 0 ? (
              <p className="text-sm text-zinc-400 dark:text-zinc-600">오늘 방문 내역이 없습니다.</p>
            ) : (
              <DonutChart
                completed={stats.completedVisits}
                active={stats.activeVisits}
                total={stats.totalVisits}
              />
            )}
          </div>
        </div>

        {/* 단계별 대기 현황 막대 차트 — 3 cols */}
        <div className="lg:col-span-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-blue-600 dark:text-blue-400">
              단계별 대기 현황
            </p>
            <span className="flex items-center gap-1.5 text-xs text-emerald-500 dark:text-emerald-400 font-medium">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${STAGE_DOT_COLOR.completed}`} />
              완료 {stats.completedVisits}건
            </span>
          </div>

          <div className="space-y-2.5">
            {pipelineStages.map(({ stage, label, path }) => {
              const count    = stats.byStage[stage] ?? 0
              const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0
              const pct      = stats.totalVisits > 0
                ? Math.round((count / stats.totalVisits) * 100)
                : 0
              const isMax    = count > 0 && count === maxCount

              return (
                <button
                  key={stage}
                  onClick={() => navigate(path)}
                  className="w-full group"
                  title={`${label} 단계로 이동`}
                >
                  <div className="flex items-center gap-3">
                    {/* 단계명 */}
                    <div className="flex items-center gap-1.5 w-[4.5rem] flex-shrink-0">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${STAGE_DOT_COLOR[stage]}`} />
                      <span className="text-xs text-zinc-500 dark:text-zinc-500 group-hover:text-zinc-800 dark:group-hover:text-zinc-200 transition-colors truncate">
                        {label}
                      </span>
                    </div>

                    {/* 막대 */}
                    <div className="flex-1 h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={[
                          'h-full rounded-full transition-all duration-700',
                          STAGE_BAR_COLOR[stage],
                          'opacity-75 group-hover:opacity-100',
                        ].join(' ')}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>

                    {/* 수치 */}
                    <div className="w-16 flex-shrink-0 flex items-center justify-end gap-1.5">
                      <span className={[
                        'text-sm font-semibold tabular-nums',
                        isMax
                          ? 'text-amber-500 dark:text-amber-400'
                          : 'text-zinc-700 dark:text-zinc-300',
                      ].join(' ')}>
                        {count}
                      </span>
                      <span className="text-[10px] text-zinc-300 dark:text-zinc-700 tabular-nums w-7 text-right">
                        {pct}%
                      </span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* 하단 총계 */}
          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-600">
            <span>전체 단계 합계</span>
            <span className="font-semibold tabular-nums text-zinc-700 dark:text-zinc-300">
              {pipelineStages.reduce((sum, { stage }) => sum + (stats.byStage[stage] ?? 0), 0)}명 대기 중
            </span>
          </div>
        </div>

    </div>
  )

  const visitsSection = (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-blue-600 dark:text-blue-400">
            오늘 방문 목록
          </p>
          <span className="text-[10px] text-zinc-400 dark:text-zinc-600">최근 15건</span>
        </div>

        {stats.recentVisits.length === 0 ? (
          <p className="text-sm text-zinc-400 dark:text-zinc-600 py-6 text-center">
            오늘 방문 내역이 없습니다.
          </p>
        ) : (
          <div
            ref={visitScroll.ref}
            onMouseEnter={visitScroll.onMouseEnter}
            onMouseLeave={visitScroll.onMouseLeave}
            className="overflow-auto max-h-[352px]"
          >
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 bg-white dark:bg-zinc-900">
                <tr className="text-[10px] tracking-[0.1em] uppercase text-zinc-400 dark:text-zinc-600 border-b border-zinc-100 dark:border-zinc-800">
                  <th className="text-left py-3 font-medium">환자명</th>
                  <th className="text-left py-3 font-medium">생년월일</th>
                  <th className="text-center py-3 font-medium">단계</th>
                  <th className="text-center py-3 font-medium">접수 시각</th>
                  <th className="text-right py-3 font-medium">본인부담금</th>
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
  )

  return (
    <div className="space-y-5">
      {/* ── 페이지 헤딩 ──────────────────────────────────── */}
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
        <RefreshButton onClick={refresh} />
      </div>

      <SortableLayout
        pageId="dashboard"
        defaultOrder={['kpi', 'charts', 'visits']}
        sections={{ kpi: kpiSection, charts: chartsSection, visits: visitsSection }}
        className="space-y-5"
      />
    </div>
  )
}
