import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/cn'
import type { WorkflowStage } from '@/types'

const STEPS: { stage: WorkflowStage; label: string; path: string }[] = [
  { stage: 'reception',    label: '접수', path: '/reception' },
  { stage: 'prescription', label: '처방', path: '/prescription' },
  { stage: 'dispensing',   label: '조제', path: '/dispensing' },
  { stage: 'review',       label: '검토', path: '/review' },
  { stage: 'payment',      label: '수납', path: '/payment' },
  { stage: 'claim',        label: '청구', path: '/claim' },
]

const STAGE_ORDER: WorkflowStage[] = [
  'reception', 'prescription', 'dispensing', 'review', 'payment', 'claim', 'completed',
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
    <nav className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-6 py-5">
      <div className="max-w-4xl mx-auto">
        <ol className="flex items-start">
          {STEPS.map((step, index) => {
            const status = getStepStatus(step.stage, currentStage)
            const isClickable = visitId && status !== 'upcoming'
            const isCompleted = status === 'completed'
            const isCurrent = status === 'current'

            return (
              <li key={step.stage} className="flex items-start flex-1">
                {/* Step node + label */}
                <button
                  onClick={() => isClickable && navigate(step.path)}
                  disabled={!isClickable}
                  className={cn(
                    'flex flex-col items-center gap-2 flex-shrink-0 group',
                    isClickable ? 'cursor-pointer' : 'cursor-not-allowed',
                  )}
                >
                  {/* Circle */}
                  <div
                    className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold border transition-all',
                      isCompleted && 'bg-amber-400 border-amber-400 text-zinc-950',
                      isCurrent && 'bg-transparent border-amber-400 text-amber-400 shadow-[0_0_0_3px_rgba(251,191,36,0.15)]',
                      status === 'upcoming' && 'bg-transparent border-zinc-300 dark:border-zinc-700 text-zinc-400 dark:text-zinc-600',
                    )}
                  >
                    {isCompleted ? (
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="2,6 5,9 10,3" />
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </div>

                  {/* Label */}
                  <span
                    className={cn(
                      'text-[10px] font-medium tracking-wide transition-colors',
                      isCurrent && 'text-amber-500 dark:text-amber-400',
                      isCompleted && 'text-zinc-500 dark:text-zinc-400 group-hover:text-amber-500 dark:group-hover:text-amber-400',
                      status === 'upcoming' && 'text-zinc-400 dark:text-zinc-600',
                    )}
                  >
                    {step.label}
                  </span>
                </button>

                {/* Connector line — aligned with circle center (mt-3.5 = 14px = half of 28px circle) */}
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      'h-px flex-1 mt-3.5 mx-2 transition-colors',
                      STAGE_ORDER.indexOf(step.stage) < STAGE_ORDER.indexOf(currentStage)
                        ? 'bg-amber-400/60'
                        : 'bg-zinc-200 dark:bg-zinc-800',
                    )}
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
