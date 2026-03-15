import { useNavigate } from 'react-router-dom'
import type { WorkflowStage } from '@/types'

const STEPS: { stage: WorkflowStage; label: string; emoji: string; path: string }[] = [
  { stage: 'reception', label: '접수', emoji: '🏥', path: '/reception' },
  { stage: 'prescription', label: '처방', emoji: '📋', path: '/prescription' },
  { stage: 'dispensing', label: '조제', emoji: '💊', path: '/dispensing' },
  { stage: 'review', label: '검토', emoji: '🔬', path: '/review' },
  { stage: 'payment', label: '수납', emoji: '💳', path: '/payment' },
  { stage: 'claim', label: '청구', emoji: '📄', path: '/claim' },
]

const STAGE_ORDER: WorkflowStage[] = [
  'reception',
  'prescription',
  'dispensing',
  'review',
  'payment',
  'claim',
  'completed',
]

function getStepStatus(
  stepStage: WorkflowStage,
  currentStage: WorkflowStage,
): 'completed' | 'current' | 'upcoming' {
  const stepIdx = STAGE_ORDER.indexOf(stepStage)
  const currentIdx = STAGE_ORDER.indexOf(currentStage)
  if (stepIdx < currentIdx) return 'completed'
  if (stepIdx === currentIdx) return 'current'
  return 'upcoming'
}

interface WorkflowStepperProps {
  currentStage: WorkflowStage
  visitId: string | null
}

export default function WorkflowStepper({ currentStage, visitId }: WorkflowStepperProps) {
  const navigate = useNavigate()

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 shadow-sm">
      <div className="max-w-5xl mx-auto">
        <ol className="flex items-center gap-1">
          {STEPS.map((step, index) => {
            const status = getStepStatus(step.stage, currentStage)
            const isClickable = visitId && status !== 'upcoming'

            return (
              <li key={step.stage} className="flex items-center flex-1">
                <button
                  onClick={() => isClickable && navigate(step.path)}
                  disabled={!isClickable}
                  className={[
                    'flex flex-col items-center gap-1 w-full py-2 rounded-lg transition-colors',
                    status === 'completed' && 'cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20',
                    status === 'current' && 'cursor-default',
                    status === 'upcoming' && 'cursor-not-allowed opacity-40',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <span
                    className={[
                      'w-9 h-9 rounded-full flex items-center justify-center text-base font-semibold transition-all',
                      status === 'completed' && 'bg-blue-500 text-white shadow-sm',
                      status === 'current' && 'bg-blue-600 text-white ring-2 ring-blue-300 dark:ring-blue-500 shadow-md',
                      status === 'upcoming' && 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {status === 'completed' ? '✓' : status === 'current' ? step.emoji : index + 1}
                  </span>
                  <span
                    className={[
                      'text-xs font-medium',
                      status === 'current' && 'text-blue-600 dark:text-blue-400',
                      status === 'completed' && 'text-blue-500 dark:text-blue-400',
                      status === 'upcoming' && 'text-gray-400 dark:text-gray-500',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {step.label}
                  </span>
                </button>

                {index < STEPS.length - 1 && (
                  <div
                    className={[
                      'h-0.5 flex-1 mx-1 transition-colors rounded-full',
                      STAGE_ORDER.indexOf(step.stage) < STAGE_ORDER.indexOf(currentStage)
                        ? 'bg-blue-400 dark:bg-blue-600'
                        : 'bg-gray-200 dark:bg-gray-700',
                    ].join(' ')}
                  />
                )}
              </li>
            )
          })}
        </ol>
      </div>
    </nav>
  )
}
