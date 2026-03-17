interface RefreshButtonProps {
  onClick: () => void
  /** 'sm' — StagePatientList 등 소형 UI, 'md' — 대시보드 헤더 등 기본 */
  size?: 'sm' | 'md'
}

const REFRESH_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="23,4 23,10 17,10" />
    <path d="M20.49,15a9,9,0,1,1-2.12-9.36L23,10" />
  </svg>
)

export default function RefreshButton({ onClick, size = 'md' }: RefreshButtonProps): JSX.Element {
  const base = [
    'flex items-center gap-1.5 rounded-xl font-medium transition-colors',
    // 라이트 — 명확한 테두리 + 중간 텍스트
    'text-zinc-600 border border-zinc-300 bg-white',
    // 다크 — 테두리·텍스트 모두 밝게 올려 가시성 확보
    'dark:text-zinc-300 dark:border-zinc-600 dark:bg-zinc-800',
    // 호버
    'hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50',
    'dark:hover:text-blue-400 dark:hover:border-blue-500 dark:hover:bg-blue-950/30',
  ].join(' ')

  if (size === 'sm') {
    return (
      <button onClick={onClick} className={`${base} text-[10px] tracking-wide px-2 py-1`}>
        <span className="w-[9px] h-[9px] flex-shrink-0">{REFRESH_ICON}</span>
        새로고침
      </button>
    )
  }

  return (
    <button onClick={onClick} className={`${base} text-xs px-3 py-1.5`}>
      <span className="w-[11px] h-[11px] flex-shrink-0">{REFRESH_ICON}</span>
      새로고침
    </button>
  )
}
