import { useEffect } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import WorkflowStepper from './WorkflowStepper'
import ToastContainer from './ui/Toast'
import CommandPalette from './CommandPalette'
import { useWorkflowStore } from '@/stores/workflowStore'
import { usePluginStore } from '@/stores/pluginStore'
import { useThemeStore } from '@/stores/themeStore'
import { pluginApi } from '@/api/endpoints'

const NAV_LINKS = [
  { to: '/dashboard', label: '대시보드' },
  { to: '/reception', label: '접수' },
  { to: '/plugins', label: 'Plugins' },
]

export default function WorkflowLayout() {
  const { currentStage, patient } = useWorkflowStore()
  const { setPlugins } = usePluginStore()
  const { theme, toggle } = useThemeStore()
  const location = useLocation()

  useEffect(() => {
    pluginApi.list()
      .then((res) => setPlugins(res.data))
      .catch((err: unknown) => console.warn('[WorkflowLayout] Plugin 목록 로드 실패:', err))
  }, [setPlugins])

  return (
    <div className="min-h-screen flex flex-col bg-[#EBFEFE] dark:bg-zinc-950 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-zinc-900 border-b border-blue-100 dark:border-zinc-800 px-8 py-4 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-[#246AFE] rounded-xl flex items-center justify-center flex-shrink-0">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <div className="text-sm font-bold tracking-tight text-[#0B0A0A] dark:text-zinc-100">
                PharmWeave
              </div>
              <div className="text-[10px] text-slate-400 dark:text-zinc-600 tracking-wide">약국 PMS</div>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            {NAV_LINKS.map(({ to, label }) => {
              const isActive = location.pathname === to || (to !== '/dashboard' && location.pathname.startsWith(to))
              return (
                <Link
                  key={to}
                  to={to}
                  className={[
                    'px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-[#246AFE] text-white'
                      : 'text-slate-500 dark:text-zinc-400 hover:bg-blue-50 dark:hover:bg-zinc-800 hover:text-blue-600 dark:hover:text-blue-400',
                  ].join(' ')}
                >
                  {label}
                </Link>
              )
            })}
          </nav>

          {/* Right side: Ctrl+K + theme toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }))}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-400 dark:text-zinc-500 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:border-zinc-300 dark:hover:border-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
              title="커맨드 팔레트 열기"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span>검색</span>
              <kbd className="font-mono text-[10px] px-1 bg-zinc-100 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700">Ctrl+K</kbd>
            </button>
            <button
              onClick={toggle}
              className="w-8 h-8 flex items-center justify-center text-slate-400 dark:text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-zinc-800 rounded-xl transition-colors"
              aria-label="테마 전환"
              title={theme === 'light' ? '다크 모드로 전환' : '라이트 모드로 전환'}
            >
              {theme === 'light' ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Workflow Stepper */}
      <WorkflowStepper currentStage={currentStage} patient={patient} />

      {/* Main Content */}
      <main className="flex-1 px-8 py-8">
        <div className="max-w-5xl mx-auto">
          <Outlet />
        </div>
      </main>

      <ToastContainer />
      <CommandPalette />
    </div>
  )
}
