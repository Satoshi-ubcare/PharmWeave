import { useNavigate } from 'react-router-dom'
import type { WorkflowStage } from '@/types'

const STEPS: { stage: WorkflowStage; label: string; path: string }[] = [
  { stage: 'reception', label: '접수', path: '/reception' },
  { stage: 'prescription', label: '처방', path: '/prescription' },
  { stage: 'dispensing', label: '조제', path: '/dispensing' },
  { stage: 'review', label: '검토', path: '/review' },
  { stage: 'payment', label: '수납', path: '/payment' },
  { stage: 'claim', label: '청구', path: '/claim' },
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
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
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
                    status === 'completed' && 'cursor-pointer hover:bg-blue-50',
                    status === 'current' && 'cursor-default',
                    status === 'upcoming' && 'cursor-not-allowed opacity-40',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <span
                    className={[
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors',
                      status === 'completed' && 'bg-blue-500 text-white',
                      status === 'current' && 'bg-blue-600 text-white ring-2 ring-blue-300',
                      status === 'upcoming' && 'bg-gray-200 text-gray-500',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {status === 'completed' ? '✓' : index + 1}
                  </span>
                  <span
                    className={[
                      'text-xs font-medium',
                      status === 'current' && 'text-blue-600',
                      status === 'completed' && 'text-blue-500',
                      status === 'upcoming' && 'text-gray-400',
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
                      'h-0.5 flex-1 mx-1 transition-colors',
                      STAGE_ORDER.indexOf(step.stage) < STAGE_ORDER.indexOf(currentStage)
                        ? 'bg-blue-400'
                        : 'bg-gray-200',
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
