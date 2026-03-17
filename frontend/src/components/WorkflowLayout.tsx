import { useEffect } from 'react'
import { Outlet, Link } from 'react-router-dom'
import WorkflowStepper from './WorkflowStepper'
import ToastContainer from './ui/Toast'
import { useWorkflowStore } from '@/stores/workflowStore'
import { usePluginStore } from '@/stores/pluginStore'
import { useThemeStore } from '@/stores/themeStore'
import { pluginApi } from '@/api/endpoints'

export default function WorkflowLayout() {
  const { currentStage, visitId, patient } = useWorkflowStore()
  const { setPlugins } = usePluginStore()
  const { theme, toggle } = useThemeStore()

  useEffect(() => {
    pluginApi.list()
      .then((res) => setPlugins(res.data))
      .catch((err: unknown) => console.warn('[WorkflowLayout] Plugin 목록 로드 실패:', err))
  }, [setPlugins])

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 transition-colors duration-200">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-amber-400 rounded-sm flex-shrink-0" />
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-semibold tracking-[0.2em] uppercase text-zinc-900 dark:text-zinc-100">
                PharmWeave
              </span>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-600 tracking-wide">약국 PMS</span>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {patient && (
              <div className="flex items-center gap-2 border border-zinc-200 dark:border-zinc-800 px-3 py-1 rounded-sm">
                <span className="text-[10px] text-zinc-400 dark:text-zinc-600 tracking-widest uppercase">환자</span>
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{patient.name}</span>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-600">
                  {String(patient.birth_date).slice(0, 10)}
                </span>
              </div>
            )}

            <button
              onClick={toggle}
              className="w-7 h-7 flex items-center justify-center text-zinc-400 dark:text-zinc-600 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
              aria-label="테마 전환"
              title={theme === 'light' ? '다크 모드로 전환' : '라이트 모드로 전환'}
            >
              {theme === 'light' ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

            <Link
              to="/dashboard"
              className="text-[10px] font-semibold tracking-[0.15em] uppercase text-zinc-400 dark:text-zinc-600 hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              to="/plugins"
              className="text-[10px] font-semibold tracking-[0.15em] uppercase text-zinc-400 dark:text-zinc-600 hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
            >
              Plugins
            </Link>
          </div>
        </div>
      </header>

      {/* Workflow Stepper */}
      <WorkflowStepper currentStage={currentStage} visitId={visitId} />

      {/* Main Content */}
      <main className="flex-1 px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <Outlet />
        </div>
      </main>

      <ToastContainer />
    </div>
  )
}
