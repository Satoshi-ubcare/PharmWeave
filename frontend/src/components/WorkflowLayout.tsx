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
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-700 to-blue-600 dark:from-gray-800 dark:to-gray-900 dark:border-b dark:border-gray-700 text-white px-6 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <span className="text-2xl">💊</span>
          <div>
            <span className="text-xl font-bold tracking-tight">PharmWeave</span>
            <span className="text-blue-200 dark:text-gray-400 text-xs ml-2">약국 PMS</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {patient && (
            <span className="text-sm bg-white/20 dark:bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1.5">
              <span>👤</span>
              <span>{patient.name}</span>
              <span className="text-blue-200 dark:text-gray-400 text-xs">({String(patient.birth_date).slice(0, 10)})</span>
            </span>
          )}
          <button
            onClick={toggle}
            className="w-8 h-8 rounded-full bg-white/20 dark:bg-white/10 hover:bg-white/30 transition-colors flex items-center justify-center text-base"
            aria-label="테마 전환"
            title={theme === 'light' ? '다크 모드로 전환' : '라이트 모드로 전환'}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <Link
            to="/plugins"
            className="text-sm text-blue-200 dark:text-gray-400 hover:text-white transition-colors flex items-center gap-1"
          >
            <span>🔌</span>
            <span>Plugin</span>
          </Link>
        </div>
      </header>

      {/* Workflow Stepper */}
      <WorkflowStepper currentStage={currentStage} visitId={visitId} />

      {/* Main Content */}
      <main className="flex-1 px-6 py-6">
        <div className="max-w-5xl mx-auto">
          <Outlet />
        </div>
      </main>

      <ToastContainer />
    </div>
  )
}
