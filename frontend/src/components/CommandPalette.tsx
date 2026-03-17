import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useThemeStore } from '@/stores/themeStore'
import { matchesKoreanSearch } from '@/lib/koreanSearch'

interface Cmd {
  id: string
  group: '페이지' | '액션'
  label: string
  desc?: string
  action: () => void
}

const PAGE_ICON = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18" />
  </svg>
)
const ACTION_ICON = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
)

export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { toggle, theme } = useThemeStore()

  const close = useCallback(() => {
    setOpen(false)
    setQuery('')
    setActive(0)
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((prev) => !prev)
        setQuery('')
        setActive(0)
      }
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [close])

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 30)
      return () => clearTimeout(t)
    }
  }, [open])

  const CMDS: Cmd[] = [
    { id: 'dashboard',    group: '페이지', label: '대시보드',       desc: '오늘 통계 & 방문 현황',            action: () => { navigate('/dashboard');    close() } },
    { id: 'reception',   group: '페이지', label: '접수',           desc: 'Step 01 — 환자 접수 & 방문 시작', action: () => { navigate('/reception');    close() } },
    { id: 'prescription',group: '페이지', label: '처방',           desc: 'Step 02 — 처방전 입력 & 약품 추가', action: () => { navigate('/prescription'); close() } },
    { id: 'dispensing',  group: '페이지', label: '조제',           desc: 'Step 03 — 약품 조제 체크리스트',   action: () => { navigate('/dispensing');   close() } },
    { id: 'review',      group: '페이지', label: '검토',           desc: 'Step 04 — 처방 & 조제 최종 검토', action: () => { navigate('/review');       close() } },
    { id: 'payment',     group: '페이지', label: '수납',           desc: 'Step 05 — 본인부담금 계산 & 결제', action: () => { navigate('/payment');      close() } },
    { id: 'claim',       group: '페이지', label: '청구',           desc: 'Step 06 — 건강보험 청구',         action: () => { navigate('/claim');        close() } },
    { id: 'plugins',     group: '페이지', label: '플러그인 관리',   desc: 'DUR, 복약지도 등 ON/OFF',          action: () => { navigate('/plugins');      close() } },
    { id: 'theme',       group: '액션',   label: `${theme === 'light' ? '다크' : '라이트'} 모드로 전환`, desc: `현재: ${theme === 'light' ? '라이트' : '다크'} 모드`, action: () => { toggle(); close() } },
  ]

  const filtered = query.trim()
    ? CMDS.filter((c) => matchesKoreanSearch(query, c.label) || matchesKoreanSearch(query, c.desc ?? ''))
    : CMDS

  const groups = ['페이지', '액션'] as const

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => {
        const next = Math.min(a + 1, filtered.length - 1)
        scrollActiveIntoView(next)
        return next
      })
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => {
        const next = Math.max(a - 1, 0)
        scrollActiveIntoView(next)
        return next
      })
    }
    if (e.key === 'Enter') filtered[active]?.action()
  }

  const scrollActiveIntoView = (idx: number) => {
    const el = listRef.current?.querySelector(`[data-idx="${idx}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-[14vh]"
      onMouseDown={close}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-lg mx-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
        onMouseDown={(e) => e.stopPropagation()}
        style={{ animation: 'cmdFadeIn 0.15s ease-out both' }}
      >
        <style>{`
          @keyframes cmdFadeIn {
            from { opacity: 0; transform: scale(0.97) translateY(-6px); }
            to   { opacity: 1; transform: scale(1)    translateY(0); }
          }
        `}</style>

        {/* Search */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-400 flex-shrink-0">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActive(0) }}
            onKeyDown={handleKeyDown}
            placeholder="페이지 이동 또는 액션 검색..."
            className="flex-1 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 outline-none"
          />
          <kbd className="text-[10px] px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-400 rounded border border-zinc-200 dark:border-zinc-700 font-mono">
            ESC
          </kbd>
        </div>

        {/* List */}
        <div ref={listRef} className="py-2 max-h-[360px] overflow-y-auto">
          {filtered.length === 0 && (
            <p className="text-center text-zinc-400 dark:text-zinc-600 text-sm py-8">검색 결과 없음</p>
          )}
          {groups.map((group) => {
            const items = filtered.filter((c) => c.group === group)
            if (items.length === 0) return null
            return (
              <div key={group}>
                <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-zinc-400 dark:text-zinc-600 px-4 pt-3 pb-1">
                  {group}
                </p>
                {items.map((cmd) => {
                  const idx = filtered.indexOf(cmd)
                  const isActive = idx === active
                  return (
                    <button
                      key={cmd.id}
                      data-idx={idx}
                      onClick={cmd.action}
                      onMouseEnter={() => setActive(idx)}
                      className={[
                        'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                        isActive ? 'bg-blue-50 dark:bg-zinc-800' : '',
                      ].join(' ')}
                    >
                      <div className={[
                        'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors',
                        isActive ? 'bg-[#246AFE] text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400',
                      ].join(' ')}>
                        {cmd.group === '페이지' ? PAGE_ICON : ACTION_ICON}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${isActive ? 'text-blue-700 dark:text-blue-300' : 'text-zinc-800 dark:text-zinc-200'}`}>
                          {cmd.label}
                        </p>
                        {cmd.desc && (
                          <p className="text-xs text-zinc-400 dark:text-zinc-600 truncate mt-0.5">{cmd.desc}</p>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-4 text-[10px] text-zinc-400 dark:text-zinc-600">
          <span><kbd className="px-1 bg-zinc-100 dark:bg-zinc-800 rounded font-mono">↑↓</kbd> 이동</span>
          <span><kbd className="px-1 bg-zinc-100 dark:bg-zinc-800 rounded font-mono">Enter</kbd> 실행</span>
          <span><kbd className="px-1 bg-zinc-100 dark:bg-zinc-800 rounded font-mono">Esc</kbd> 닫기</span>
        </div>
      </div>
    </div>
  )
}
