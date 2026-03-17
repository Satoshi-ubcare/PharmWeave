interface DonutChartProps {
  completed: number
  active: number
  total: number
  /** 'md' — 대시보드 기본 (136px), 'lg' — 상세 페이지 (196px) */
  size?: 'md' | 'lg'
}

export default function DonutChart({ completed, active, total, size = 'md' }: DonutChartProps): JSX.Element {
  const dim = size === 'lg'
    ? { wh: 196, R: 76, cx: 98, cy: 98, sw: 18, textLg: 'text-4xl', textSm: 'text-2xl' }
    : { wh: 136, R: 52, cx: 68, cy: 68, sw: 13, textLg: 'text-3xl', textSm: 'text-lg' }

  const C            = 2 * Math.PI * dim.R
  const completedArc = total > 0 ? (completed / total) * C : 0
  const activeArc    = total > 0 ? (active    / total) * C : 0
  const pct          = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: dim.wh, height: dim.wh }}>
        <svg width={dim.wh} height={dim.wh} viewBox={`0 0 ${dim.wh} ${dim.wh}`} aria-hidden="true">
          {/* 트랙 */}
          <circle
            cx={dim.cx} cy={dim.cy} r={dim.R}
            fill="none" stroke="currentColor" strokeWidth={dim.sw}
            className="text-zinc-100 dark:text-zinc-800"
          />
          {/* 진행중 — blue */}
          {active > 0 && (
            <circle
              cx={dim.cx} cy={dim.cy} r={dim.R}
              fill="none" stroke="#3b82f6" strokeWidth={dim.sw}
              strokeDasharray={`${activeArc} ${C}`}
              strokeDashoffset={-completedArc}
              transform={`rotate(-90 ${dim.cx} ${dim.cy})`}
              style={{ transition: 'stroke-dasharray 0.7s ease' }}
            />
          )}
          {/* 완료 — emerald */}
          {completed > 0 && (
            <circle
              cx={dim.cx} cy={dim.cy} r={dim.R}
              fill="none" stroke="#10b981" strokeWidth={dim.sw}
              strokeDasharray={`${completedArc} ${C}`}
              strokeDashoffset={0}
              transform={`rotate(-90 ${dim.cx} ${dim.cy})`}
              style={{ transition: 'stroke-dasharray 0.7s ease' }}
            />
          )}
        </svg>

        {/* 가운데 텍스트 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
          <span className={`font-bold tabular-nums text-zinc-900 dark:text-zinc-100 leading-none ${dim.textLg}`}>
            {pct}<span className={`font-semibold ${dim.textSm}`}>%</span>
          </span>
          <span className="text-[10px] tracking-widest uppercase text-zinc-400 dark:text-zinc-600 mt-1">완료율</span>
          {total > 0 && (
            <span className="text-[10px] text-zinc-400 dark:text-zinc-600 mt-0.5">총 {total}건</span>
          )}
        </div>
      </div>

      {/* 범례 */}
      <div className="flex gap-5 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
          <span className="text-zinc-500 dark:text-zinc-500">
            완료&nbsp;<strong className="font-semibold text-zinc-700 dark:text-zinc-300">{completed}건</strong>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0" />
          <span className="text-zinc-500 dark:text-zinc-500">
            진행중&nbsp;<strong className="font-semibold text-zinc-700 dark:text-zinc-300">{active}건</strong>
          </span>
        </div>
      </div>
    </div>
  )
}
