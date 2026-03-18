import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { useWorkflowStore } from '@/stores/workflowStore'
import PatientInfoModal from './PatientInfoModal'
import type { WorkflowStage, Patient } from '@/types'

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
  patient: Patient | null
}

export default function WorkflowStepper({ currentStage, patient }: WorkflowStepperProps) {
  const navigate = useNavigate()
  const { setPatient } = useWorkflowStore()
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <nav data-testid="workflow-stepper" className="bg-white dark:bg-zinc-900 border-b border-blue-100 dark:border-zinc-800 px-8 py-4">
      <div className="max-w-5xl mx-auto flex items-center gap-6">

        {/* 환자 정보 */}
        <div className="flex-shrink-0">
          {patient ? (
            <>
              <button
                onClick={() => setModalOpen(true)}
                title="환자 정보 확인/수정"
                className="flex items-center gap-2.5 px-3 py-2 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/25 rounded-xl cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-500/20 hover:border-blue-300 dark:hover:border-blue-500/40 transition-colors"
              >
                {/* 아바타 */}
                <div className="w-9 h-9 bg-[#246AFE] rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                  <span className="text-white text-base font-bold leading-none">{patient.name[0]}</span>
                </div>
                <div className="min-w-0 text-left">
                  <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-blue-600 dark:text-blue-400 mb-0.5">
                    현재 환자
                  </p>
                  <p className="text-base font-bold text-zinc-900 dark:text-zinc-100 leading-tight truncate">
                    {patient.name}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-0.5 tabular-nums">
                    {String(patient.birth_date).slice(0, 10)}
                  </p>
                </div>
              </button>
              <PatientInfoModal
                patient={patient}
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onUpdated={(updated) => { setPatient(updated); setModalOpen(false) }}
              />
            </>
          ) : (
            <div className="px-3 py-2 w-36">
              <p className="text-[10px] font-semibold tracking-[0.12em] uppercase text-zinc-300 dark:text-zinc-700 mb-1">
                환자 미선택
              </p>
              <p className="text-sm text-zinc-300 dark:text-zinc-700">—</p>
            </div>
          )}
        </div>

        {/* 구분선 */}
        <div className="w-px self-stretch bg-zinc-100 dark:bg-zinc-800 flex-shrink-0" />

        {/* 단계 스테퍼 */}
        <ol className="flex items-start flex-1">
          {STEPS.map((step, index) => {
            const status = getStepStatus(step.stage, currentStage)
            const isCompleted = status === 'completed'
            const isCurrent = status === 'current'

            const isUpcomingWithPatient = !!patient && status === 'upcoming'
            const title = isUpcomingWithPatient
              ? '아직 이 단계에 도달하지 않았습니다'
              : isCompleted
              ? `${step.label} 단계로 돌아가기`
              : undefined

            return (
              <li key={step.stage} className="flex items-start flex-1">
                <button
                  onClick={() => !isUpcomingWithPatient && navigate(step.path)}
                  disabled={isUpcomingWithPatient}
                  title={title}
                  className={cn(
                    'flex flex-col items-center gap-2 flex-shrink-0 group',
                    isUpcomingWithPatient ? 'cursor-not-allowed' : 'cursor-pointer',
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
