import { Outlet, Link } from 'react-router-dom'
import WorkflowStepper from './WorkflowStepper'
import { useWorkflowStore } from '@/stores/workflowStore'

export default function WorkflowLayout() {
  const { currentStage, visitId, patient } = useWorkflowStore()

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-blue-700 text-white px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold tracking-tight">PharmWeave</span>
          <span className="text-blue-200 text-sm">약국 PMS</span>
        </div>
        <div className="flex items-center gap-4">
          {patient && (
            <span className="text-sm bg-blue-600 px-3 py-1 rounded-full">
              {patient.name} ({String(patient.birth_date).slice(0, 10)})
            </span>
          )}
          <Link
            to="/plugins"
            className="text-sm text-blue-200 hover:text-white transition-colors"
          >
            Plugin 관리
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
    </div>
  )
}
