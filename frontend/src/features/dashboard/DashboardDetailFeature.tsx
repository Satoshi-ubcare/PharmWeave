import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTodayVisits } from '@/hooks/useTodayVisits'
import { useDashboardStats } from '@/hooks/useDashboard'
import { useWorkflowStore } from '@/stores/workflowStore'
import Spinner from '@/components/ui/Spinner'
import RefreshButton from '@/components/ui/RefreshButton'
import DonutChart from '@/components/ui/DonutChart'
import type { WorkflowStage } from '@/types'

// ─── 상수 ──────────────────────────────────────────────────
type DetailView = 'total' | 'active' | 'completed' | 'revenue' | 'status'

const VIEW_META: Record<DetailView, { title: string; sub: string }> = {
  total:     { title: '오늘 총 방문',    sub: '접수 이후 전체 방문 목록' },
  active:    { title: '진행 중',        sub: '완료되지 않은 모든 방문' },
  completed: { title: '처리 완료',      sub: '오늘 완료된 방문 목록' },
  revenue:   { title: '오늘 수납 합계', sub: '본인부담금 기준 수납 내역' },
  status:    { title: '처리 현황',      sub: '단계별 완료율 및 대기 현황' },
}

const STAGE_LABEL: Record<WorkflowStage, string> = {
  reception: '접수', prescription: '처방', dispensing: '조제',
  review: '검토', payment: '수납', claim: '청구', completed: '완료',
}

const STAGE_PATH: Record<WorkflowStage, string> = {
  reception: '/reception', prescription: '/prescription', dispensing: '/dispensing',
  review: '/review', payment: '/payment', claim: '/claim', completed: '/reception',
}

const STAGE_ORDER: WorkflowStage[] = [
  'reception', 'prescription', 'dispensing', 'review', 'payment', 'claim', 'completed',
]

const PIPELINE_STAGES: WorkflowStage[] = [
  'reception', 'prescription', 'dispensing', 'review', 'payment', 'claim',
]

const STAGE_BAR_COLOR: Record<WorkflowStage, string> = {
  reception:    'bg-slate-400',
  prescription: 'bg-blue-500',
  dispensing:   'bg-violet-500',
  review:       'bg-amber-500',
  payment:      'bg-cyan-500',
  claim:        'bg-rose-500',
  completed:    'bg-emerald-500',
}

const STAGE_BADGE_COLOR: Record<WorkflowStage, string> = {
  reception:    'bg-zinc-100    dark:bg-zinc-800       text-zinc-600   dark:text-zinc-400',
  prescription: 'bg-blue-50    dark:bg-blue-950/40    text-blue-600   dark:text-blue-400',
  dispensing:   'bg-violet-50  dark:bg-violet-950/40  text-violet-600 dark:text-violet-400',
  review:       'bg-amber-50   dark:bg-amber-950/40   text-amber-600  dark:text-amber-400',
  payment:      'bg-cyan-50    dark:bg-cyan-950/40    text-cyan-600   dark:text-cyan-400',
  claim:        'bg-rose-50    dark:bg-rose-950/40    text-rose-600   dark:text-rose-400',
  completed:    'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
}

const STAGE_CARD_COLOR: Record<WorkflowStage, string> = {
  reception:    'border-slate-200   dark:border-slate-700   bg-slate-50   dark:bg-slate-900/30',
  prescription: 'border-blue-200    dark:border-blue-800    bg-blue-50    dark:bg-blue-950/30',
  dispensing:   'border-violet-200  dark:border-violet-800  bg-violet-50  dark:bg-violet-950/30',
  review:       'border-amber-200   dark:border-amber-800   bg-amber-50   dark:bg-amber-950/30',
  payment:      'border-cyan-200    dark:border-cyan-800    bg-cyan-50    dark:bg-cyan-950/30',
  claim:        'border-rose-200    dark:border-rose-800    bg-rose-50    dark:bg-rose-950/30',
  completed:    'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30',
}

const STAGE_COUNT_COLOR: Record<WorkflowStage, string> = {
  reception:    'text-slate-600   dark:text-slate-400',
  prescription: 'text-blue-600    dark:text-blue-400',
  dispensing:   'text-violet-600  dark:text-violet-400',
  review:       'text-amber-600   dark:text-amber-400',
  payment:      'text-cyan-600    dark:text-cyan-400',
  claim:        'text-rose-600    dark:text-rose-400',
  completed:    'text-emerald-600 dark:text-emerald-400',
}

// ─── 공통 — 방문 테이블 ────────────────────────────────────
interface VisitRow {
  id: string
  patient: { name: string; birth_date: string }
  workflow_stage: WorkflowStage
  visited_at: string
  copay_amount?: number | null
}

interface VisitTableProps {
  rows: VisitRow[]
  showCopay?: boolean
  onRowClick: (row: VisitRow) => void
}

function VisitTable({ rows, showCopay = false, onRowClick }: VisitTableProps): JSX.Element {
  if (rows.length === 0) {
    return (
      <p className="text-sm text-zinc-400 dark:text-zinc-600 py-10 text-center">
        해당하는 방문 내역이 없습니다.
      </p>
    )
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[10px] tracking-[0.1em] uppercase text-zinc-400 dark:text-zinc-600 border-b border-zinc-100 dark:border-zinc-800">
            <th className="text-left py-3 font-medium">환자명</th>
            <th className="text-left py-3 font-medium">생년월일</th>
            <th className="text-center py-3 font-medium">단계</th>
            <th className="text-center py-3 font-medium">접수 시각</th>
            {showCopay && <th className="text-right py-3 font-medium">본인부담금</th>}
            <th className="w-6" />
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
          {rows.map((row) => (
            <tr
              key={row.id}
              onClick={() => onRowClick(row)}
              className="cursor-pointer hover:bg-blue-50/50 dark:hover:bg-zinc-800/50 transition-colors group"
            >
              <td className="py-3 font-medium text-zinc-900 dark:text-zinc-100">
                {row.patient.name}
              </td>
              <td className="py-3 text-zinc-400 dark:text-zinc-600 text-xs">
                {String(row.patient.birth_date).slice(0, 10)}
              </td>
              <td className="py-3 text-center">
                <span className={`text-[10px] font-semibold tracking-wide px-2 py-0.5 rounded-lg ${STAGE_BADGE_COLOR[row.workflow_stage]}`}>
                  {STAGE_LABEL[row.workflow_stage]}
                </span>
              </td>
              <td className="py-3 text-center text-xs text-zinc-400 dark:text-zinc-600">
                {new Date(row.visited_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
              </td>
              {showCopay && (
                <td className="py-3 text-right text-xs font-medium">
                  {row.copay_amount != null
                    ? <span className="text-blue-700 dark:text-blue-400">{row.copay_amount.toLocaleString()}원</span>
                    : <span className="text-zinc-300 dark:text-zinc-700">—</span>
                  }
                </td>
              )}
              <td className="py-3 text-center">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  className="text-zinc-200 dark:text-zinc-700 group-hover:text-blue-500 transition-colors mx-auto">
                  <polyline points="9,18 15,12 9,6" />
                </svg>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── VIEW 1: 오늘 총 방문 ──────────────────────────────────
interface TotalViewProps {
  visits: VisitRow[]
  onRowClick: (row: VisitRow) => void
}

function TotalView({ visits, onRowClick }: TotalViewProps): JSX.Element {
  const [activeStage, setActiveStage] = useState<WorkflowStage | 'all'>('all')

  const filtered = activeStage === 'all'
    ? visits
    : visits.filter((v) => v.workflow_stage === activeStage)

  const countByStage = STAGE_ORDER.reduce<Record<string, number>>((acc, s) => {
    acc[s] = visits.filter((v) => v.workflow_stage === s).length
    return acc
  }, {})

  return (
    <div className="space-y-4">
      {/* 요약 수치 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: '전체', count: visits.length, color: 'text-zinc-900 dark:text-zinc-100' },
          { label: '진행 중', count: visits.filter((v) => v.workflow_stage !== 'completed').length, color: 'text-blue-600 dark:text-blue-400' },
          { label: '완료', count: countByStage['completed'] ?? 0, color: 'text-emerald-600 dark:text-emerald-400' },
          { label: '접수만', count: countByStage['reception'] ?? 0, color: 'text-zinc-500 dark:text-zinc-400' },
        ].map(({ label, count, color }) => (
          <div key={label} className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold tabular-nums ${color}`}>{count}</p>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-600 mt-1 uppercase tracking-wide">{label}</p>
          </div>
        ))}
      </div>

      {/* 단계 필터 탭 */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setActiveStage('all')}
          className={[
            'text-xs px-3 py-1.5 rounded-xl transition-colors font-medium',
            activeStage === 'all'
              ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700',
          ].join(' ')}
        >
          전체 {visits.length}
        </button>
        {STAGE_ORDER.map((stage) => {
          const count = countByStage[stage] ?? 0
          if (count === 0) return null
          return (
            <button
              key={stage}
              onClick={() => setActiveStage(stage)}
              className={[
                'text-xs px-3 py-1.5 rounded-xl transition-colors font-medium',
                activeStage === stage
                  ? `${STAGE_BADGE_COLOR[stage]} font-semibold`
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700',
              ].join(' ')}
            >
              {STAGE_LABEL[stage]} {count}
            </button>
          )
        })}
      </div>

      {/* 테이블 */}
      <VisitTable rows={filtered} onRowClick={onRowClick} />
    </div>
  )
}

// ─── VIEW 2: 진행 중 ───────────────────────────────────────
function ActiveView({ visits, onRowClick }: TotalViewProps): JSX.Element {
  const activeVisits = visits.filter((v) => v.workflow_stage !== 'completed')
  const navigate = useNavigate()

  return (
    <div className="space-y-5">
      {/* 단계별 카드 그리드 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {PIPELINE_STAGES.map((stage) => {
          const count = activeVisits.filter((v) => v.workflow_stage === stage).length
          return (
            <button
              key={stage}
              onClick={() => navigate(STAGE_PATH[stage])}
              className={[
                'rounded-xl border p-4 text-center transition-all hover:shadow-md hover:-translate-y-0.5',
                STAGE_CARD_COLOR[stage],
              ].join(' ')}
            >
              <p className={`text-3xl font-bold tabular-nums ${STAGE_COUNT_COLOR[stage]}`}>{count}</p>
              <p className="text-[10px] uppercase tracking-wide text-zinc-500 dark:text-zinc-500 mt-1">
                {STAGE_LABEL[stage]} 대기
              </p>
            </button>
          )
        })}
      </div>

      {/* 진행 중 전체 목록 */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
        <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-blue-600 dark:text-blue-400 mb-4">
          진행 중 목록 — {activeVisits.length}건
        </p>
        <VisitTable rows={activeVisits} onRowClick={onRowClick} />
      </div>
    </div>
  )
}

// ─── VIEW 3: 처리 완료 ─────────────────────────────────────
function CompletedView({ visits, onRowClick }: TotalViewProps): JSX.Element {
  const completedVisits = visits.filter((v) => v.workflow_stage === 'completed')
  const total = visits.length
  const pct   = total > 0 ? Math.round((completedVisits.length / total) * 100) : 0

  return (
    <div className="space-y-5">
      {/* 완료율 강조 배너 */}
      <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-6 flex items-center gap-6">
        {/* 원형 진행바 (간단 SVG) */}
        <div className="relative flex-shrink-0">
          <svg width="80" height="80" viewBox="0 0 80 80" aria-hidden="true">
            <circle cx="40" cy="40" r="32" fill="none" stroke="currentColor" strokeWidth="8"
              className="text-emerald-100 dark:text-emerald-900" />
            <circle cx="40" cy="40" r="32" fill="none" stroke="#10b981" strokeWidth="8"
              strokeDasharray={`${pct * 2.01} 201`}
              strokeDashoffset="0"
              transform="rotate(-90 40 40)"
              style={{ transition: 'stroke-dasharray 0.7s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">{pct}%</span>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
            {completedVisits.length}<span className="text-base font-medium ml-1">건 완료</span>
          </p>
          <p className="text-sm text-emerald-600 dark:text-emerald-500">
            오늘 총 {total}건 중 {completedVisits.length}건 처리 완료
          </p>
          <p className="text-xs text-emerald-500 dark:text-emerald-600">
            나머지 {total - completedVisits.length}건 진행 중
          </p>
        </div>
      </div>

      {/* 완료 목록 */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
        <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-blue-600 dark:text-blue-400 mb-4">
          완료 목록
        </p>
        <VisitTable rows={completedVisits} onRowClick={onRowClick} />
      </div>
    </div>
  )
}

// ─── VIEW 4: 오늘 수납 합계 ────────────────────────────────
interface RevenueViewProps {
  totalRevenue: number
  paidVisits: Array<{
    id: string
    patient: { name: string; birth_date: string }
    workflow_stage: WorkflowStage
    visited_at: string
    copay_amount: number | null
  }>
  onRowClick: (row: VisitRow) => void
}

function RevenueView({ totalRevenue, paidVisits, onRowClick }: RevenueViewProps): JSX.Element {
  const paid    = paidVisits.filter((v) => v.copay_amount !== null)
  const avgCopay = paid.length > 0
    ? Math.round(paid.reduce((sum, v) => sum + (v.copay_amount ?? 0), 0) / paid.length)
    : 0
  const maxCopay = paid.length > 0
    ? Math.max(...paid.map((v) => v.copay_amount ?? 0))
    : 0

  return (
    <div className="space-y-5">
      {/* 수납 요약 카드 3개 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/30 dark:border-blue-500/20 rounded-xl p-5 text-center">
          <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-blue-600 dark:text-blue-400 mb-2">
            오늘 수납 합계
          </p>
          <p className="text-3xl font-bold tabular-nums text-blue-700 dark:text-blue-300">
            {totalRevenue.toLocaleString()}
            <span className="text-lg font-medium ml-1">원</span>
          </p>
        </div>
        <div className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl p-5 text-center">
          <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-zinc-400 dark:text-zinc-500 mb-2">
            수납 건수
          </p>
          <p className="text-3xl font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
            {paid.length}<span className="text-lg font-medium ml-1">건</span>
          </p>
        </div>
        <div className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl p-5 text-center">
          <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-zinc-400 dark:text-zinc-500 mb-2">
            평균 본인부담금
          </p>
          <p className="text-3xl font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
            {avgCopay.toLocaleString()}
            <span className="text-lg font-medium ml-1">원</span>
          </p>
        </div>
      </div>

      {/* 금액 분포 막대 (최대 대비 비율) */}
      {paid.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 space-y-3">
          <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-blue-600 dark:text-blue-400">
            수납 내역 — 금액 분포
          </p>
          <div className="space-y-2">
            {paid
              .slice()
              .sort((a, b) => (b.copay_amount ?? 0) - (a.copay_amount ?? 0))
              .map((v) => {
                const amount   = v.copay_amount ?? 0
                const barWidth = maxCopay > 0 ? (amount / maxCopay) * 100 : 0
                return (
                  <button
                    key={v.id}
                    onClick={() => onRowClick(v)}
                    className="w-full group flex items-center gap-3 text-left"
                  >
                    <span className="w-16 flex-shrink-0 text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate">
                      {v.patient.name}
                    </span>
                    <div className="flex-1 h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-blue-500 opacity-75 group-hover:opacity-100 transition-all duration-500"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                    <span className="w-24 flex-shrink-0 text-xs font-semibold tabular-nums text-blue-700 dark:text-blue-400 text-right">
                      {amount.toLocaleString()}원
                    </span>
                  </button>
                )
              })}
          </div>
          {paidVisits.length > paid.length && (
            <p className="text-[10px] text-zinc-400 dark:text-zinc-600 pt-1">
              * 수납 금액은 최근 {paidVisits.length}건 기준입니다.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// ─── VIEW 5: 처리 현황 ─────────────────────────────────────
interface StatusViewProps {
  completed: number
  active: number
  total: number
  byStage: Partial<Record<WorkflowStage, number>>
}

function StatusView({ completed, active, total, byStage }: StatusViewProps): JSX.Element {
  const navigate = useNavigate()
  const maxCount = Math.max(1, ...PIPELINE_STAGES.map((s) => byStage[s] ?? 0))

  return (
    <div className="space-y-6">
      {/* 도넛 + 단계 카드 */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
        {/* 도넛 차트 (large) */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 flex flex-col items-center gap-2">
          <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-blue-600 dark:text-blue-400 self-start">
            전체 완료율
          </p>
          <div className="py-4">
            {total === 0 ? (
              <p className="text-sm text-zinc-400 dark:text-zinc-600 py-10">오늘 방문 내역이 없습니다.</p>
            ) : (
              <DonutChart completed={completed} active={active} total={total} size="lg" />
            )}
          </div>
        </div>

        {/* 단계별 현황 바 차트 */}
        <div className="lg:col-span-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 space-y-4">
          <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-blue-600 dark:text-blue-400">
            단계별 대기 현황
          </p>
          <div className="space-y-3">
            {PIPELINE_STAGES.map((stage) => {
              const count    = byStage[stage] ?? 0
              const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0
              const pct      = total > 0 ? Math.round((count / total) * 100) : 0
              const isMax    = count > 0 && count === maxCount
              return (
                <button
                  key={stage}
                  onClick={() => navigate(STAGE_PATH[stage])}
                  title={`${STAGE_LABEL[stage]} 단계로 이동`}
                  className="w-full group flex items-center gap-3"
                >
                  <div className="flex items-center gap-1.5 w-[4.5rem] flex-shrink-0">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${STAGE_BAR_COLOR[stage]}`} />
                    <span className="text-xs text-zinc-500 group-hover:text-zinc-800 dark:group-hover:text-zinc-200 transition-colors">
                      {STAGE_LABEL[stage]}
                    </span>
                  </div>
                  <div className="flex-1 h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${STAGE_BAR_COLOR[stage]} opacity-75 group-hover:opacity-100`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                  <div className="w-16 flex-shrink-0 flex items-center justify-end gap-1.5">
                    <span className={`text-sm font-semibold tabular-nums ${isMax ? 'text-amber-500 dark:text-amber-400' : 'text-zinc-700 dark:text-zinc-300'}`}>
                      {count}
                    </span>
                    <span className="text-[10px] text-zinc-300 dark:text-zinc-700 tabular-nums w-7 text-right">
                      {pct}%
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-emerald-500 dark:text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
              완료 {completed}건
            </div>
            <span className="text-xs text-zinc-400 dark:text-zinc-600 tabular-nums">
              전체 {total}건
            </span>
          </div>
        </div>
      </div>

      {/* 단계 바로가기 카드 */}
      <div>
        <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-blue-600 dark:text-blue-400 mb-3">
          단계 바로가기
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {PIPELINE_STAGES.map((stage) => {
            const count = byStage[stage] ?? 0
            return (
              <button
                key={stage}
                onClick={() => navigate(STAGE_PATH[stage])}
                className={[
                  'rounded-xl border p-4 text-center transition-all hover:shadow-md hover:-translate-y-0.5',
                  STAGE_CARD_COLOR[stage],
                ].join(' ')}
              >
                <p className={`text-3xl font-bold tabular-nums ${STAGE_COUNT_COLOR[stage]}`}>{count}</p>
                <p className="text-[10px] uppercase tracking-wide text-zinc-500 dark:text-zinc-500 mt-1.5">
                  {STAGE_LABEL[stage]}
                </p>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-600 mt-0.5">
                  {count > 0 ? '대기 중' : '없음'}
                </p>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── 메인 컴포넌트 ─────────────────────────────────────────
export default function DashboardDetailFeature(): JSX.Element {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const view = (searchParams.get('view') ?? 'total') as DetailView
  const { setVisit } = useWorkflowStore()

  const { visits, loading: visitsLoading, error: visitsError, refresh: refreshVisits } = useTodayVisits()
  const { stats, loading: statsLoading, error: statsError, refresh: refreshStats } = useDashboardStats()

  const loading = visitsLoading || statsLoading
  const error   = visitsError ?? statsError

  const meta = VIEW_META[view] ?? VIEW_META.total

  // 방문 행 클릭 → 해당 단계로 이동
  const handleRowClick = (row: VisitRow): void => {
    setVisit(
      {
        id: row.id,
        patient_id: '',
        workflow_stage: row.workflow_stage,
        visited_at: row.visited_at,
        created_at: row.visited_at,
        updated_at: row.visited_at,
      },
      {
        id: '',
        name: row.patient.name,
        birth_date: row.patient.birth_date,
        phone: null,
        gender: null,
        allergies: null,
        insurance_type: 'health_insurance' as const,
        copay_exemption: 'none' as const,
        created_at: row.visited_at,
      },
    )
    navigate(STAGE_PATH[row.workflow_stage])
  }

  const handleRefresh = (): void => {
    refreshVisits()
    refreshStats()
  }

  return (
    <div className="space-y-6">
      {/* ── 헤더 ──────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          {/* 뒤로가기 */}
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-600 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-2"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15,18 9,12 15,6" />
            </svg>
            대시보드
          </button>
          <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-blue-600 dark:text-blue-400">
            상세 보기
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            {meta.title}
          </h1>
          <p className="text-xs text-zinc-400 dark:text-zinc-600">{meta.sub}</p>
        </div>
        <RefreshButton onClick={handleRefresh} />
      </div>

      {/* ── 로딩 ──────────────────────────────────────────── */}
      {loading && (
        <div className="flex items-center justify-center py-24 gap-3 text-zinc-400 dark:text-zinc-600">
          <Spinner size="md" className="text-zinc-400" />
          <span className="text-sm">데이터 불러오는 중...</span>
        </div>
      )}

      {/* ── 에러 ──────────────────────────────────────────── */}
      {!loading && error && (
        <div className="py-20 text-center space-y-3">
          <p className="text-sm text-red-400">{error}</p>
          <button onClick={handleRefresh} className="text-xs text-blue-600 underline underline-offset-2">
            다시 시도
          </button>
        </div>
      )}

      {/* ── 뷰 본문 ───────────────────────────────────────── */}
      {!loading && !error && (
        <>
          {view === 'total' && (
            <TotalView visits={visits as VisitRow[]} onRowClick={handleRowClick} />
          )}
          {view === 'active' && (
            <ActiveView visits={visits as VisitRow[]} onRowClick={handleRowClick} />
          )}
          {view === 'completed' && (
            <CompletedView visits={visits as VisitRow[]} onRowClick={handleRowClick} />
          )}
          {view === 'revenue' && stats && (
            <RevenueView
              totalRevenue={stats.totalRevenue}
              paidVisits={stats.recentVisits}
              onRowClick={handleRowClick}
            />
          )}
          {view === 'status' && stats && (
            <StatusView
              completed={stats.completedVisits}
              active={stats.activeVisits}
              total={stats.totalVisits}
              byStage={stats.byStage}
            />
          )}
        </>
      )}
    </div>
  )
}
