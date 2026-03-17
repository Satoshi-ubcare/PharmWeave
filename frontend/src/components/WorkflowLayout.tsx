import { useEffect } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import WorkflowStepper from './WorkflowStepper'
import ToastContainer from './ui/Toast'
import { useWorkflowStore } from '@/stores/workflowStore'
import { usePluginStore } from '@/stores/pluginStore'
import { pluginApi } from '@/api/endpoints'

const NAV_LINKS = [
  { to: '/dashboard', label: '대시보드' },
  { to: '/reception', label: '접수' },
  { to: '/plugins', label: '플러그인' },
]

export default function WorkflowLayout() {
  const { currentStage, visitId, patient } = useWorkflowStore()
  const { setPlugins } = usePluginStore()
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

          {/* Patient badge */}
          {patient && (
            <div className="flex items-center gap-2 bg-blue-50 dark:bg-zinc-800 border border-blue-200 dark:border-zinc-700 px-3 py-1.5 rounded-xl">
              <div className="w-1.5 h-1.5 rounded-full bg-[#246AFE] flex-shrink-0" />
              <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">{patient.name}</span>
              <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                {String(patient.birth_date).slice(0, 10)}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Workflow Stepper */}
      <WorkflowStepper currentStage={currentStage} visitId={visitId} />

      {/* Main Content */}
      <main className="flex-1 px-8 py-8">
        <div className="max-w-5xl mx-auto">
          <Outlet />
        </div>
      </main>

      <ToastContainer />
    </div>
  )
}
