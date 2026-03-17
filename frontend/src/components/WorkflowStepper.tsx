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
}

export default function WorkflowStepper({ currentStage }: WorkflowStepperProps) {
  const navigate = useNavigate()

  return (
    <nav data-testid="workflow-stepper" className="bg-white dark:bg-zinc-900 border-b border-blue-100 dark:border-zinc-800 px-8 py-4">
      <div className="max-w-5xl mx-auto">
        <ol className="flex items-start">
          {STEPS.map((step, index) => {
            const status = getStepStatus(step.stage, currentStage)
            const isCompleted = status === 'completed'
            const isCurrent = status === 'current'

            return (
              <li key={step.stage} className="flex items-start flex-1">
                {/* Step node + label */}
                <button
                  onClick={() => navigate(step.path)}
                  className={cn(
                    'flex flex-col items-center gap-2 flex-shrink-0 group cursor-pointer',
                  )}
                >
                  {/* Circle */}
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold border-2 transition-all',
                      isCompleted && 'bg-[#246AFE] border-[#246AFE] text-white',
                      isCurrent && 'bg-transparent border-[#246AFE] text-[#246AFE] shadow-[0_0_0_3px_rgba(36,106,254,0.15)]',
                      status === 'upcoming' && 'bg-transparent border-slate-200 dark:border-zinc-700 text-slate-400 dark:text-zinc-600 group-hover:border-[#246AFE]/40 group-hover:text-[#246AFE]/60',
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
                      isCurrent && 'text-[#246AFE]',
                      isCompleted && 'text-slate-400 dark:text-zinc-500 group-hover:text-[#246AFE]',
                      status === 'upcoming' && 'text-slate-300 dark:text-zinc-600 group-hover:text-[#246AFE]/60',
                    )}
                  >
                    {step.label}
                  </span>
                </button>

                {/* Connector line */}
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      'h-0.5 flex-1 mt-4 mx-2 rounded-full transition-colors',
                      STAGE_ORDER.indexOf(step.stage) < STAGE_ORDER.indexOf(currentStage)
                        ? 'bg-[#246AFE]'
                        : 'bg-slate-200 dark:bg-zinc-800',
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
