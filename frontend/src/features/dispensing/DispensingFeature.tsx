import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWorkflowStore } from '@/stores/workflowStore'
import { usePrescription } from '@/hooks/usePrescription'
import { useWorkflowStage } from '@/hooks/useVisit'
import { useToast } from '@/hooks/useToast'
import StagePatientList from '@/components/StagePatientList'
import Spinner from '@/components/ui/Spinner'

export default function DispensingFeature() {
  const navigate = useNavigate()
  const { visitId, setStage } = useWorkflowStore()
  const { prescription, loading, error: prescriptionError } = usePrescription(visitId)
  const { loading: submitting, error: stageError, transition } = useWorkflowStage()
  const { toast } = useToast()
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  useEffect(() => { if (stageError) toast('error', stageError) }, [stageError, toast])
  useEffect(() => { if (prescriptionError) toast('error', prescriptionError) }, [prescriptionError, toast])

  useEffect(() => {
    if (!prescription) return
    const init: Record<string, boolean> = {}
    prescription.items.forEach((item) => { init[item.id] = false })
    setChecked(init)
  }, [prescription])

  const allChecked = prescription
    ? prescription.items.every((item) => checked[item.id])
    : false

  const checkedCount = Object.values(checked).filter(Boolean).length

  const handleComplete = async () => {
    if (!visitId || !allChecked) return
    await transition(visitId, 'review')
    setStage('review')
    navigate('/review')
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-blue-600 dark:text-blue-400">
          Step 03
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">조제</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-500">대기 환자를 선택하면 처방 항목이 표시됩니다.</p>
      </div>

      <StagePatientList stage="dispensing" />

      {!visitId && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 text-center text-zinc-400 dark:text-zinc-600 text-sm">
          위 목록에서 조제할 환자를 선택하세요.
        </div>
      )}

      {visitId && loading && (
        <div className="flex items-center gap-3 text-zinc-400 dark:text-zinc-600 text-sm py-4">
          <Spinner size="md" className="text-zinc-400" />
          <span>처방 정보를 불러오는 중...</span>
        </div>
      )}

      {visitId && !loading && prescription && (
        <>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-blue-600 dark:text-blue-400 mb-1">
                  조제 체크리스트
                </p>
                <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  {prescription.clinic_name}
                  <span className="text-zinc-400 dark:text-zinc-600 font-normal ml-2 text-xs">
                    {String(prescription.prescribed_at).slice(0, 10)}
                  </span>
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-zinc-400 dark:text-zinc-600">
                  {checkedCount} / {prescription.items.length}
                </span>
                {/* Progress bar */}
                <div className="w-24 h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="h-full bg-[#246AFE] transition-all duration-300"
                    style={{ width: `${prescription.items.length > 0 ? (checkedCount / prescription.items.length) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Drug list */}
            <ul className="space-y-2">
              {prescription.items.map((item) => (
                <li
                  key={item.id}
                  onClick={() => setChecked({ ...checked, [item.id]: !checked[item.id] })}
                  className={[
                    'flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer select-none',
                    checked[item.id]
                      ? 'bg-emerald-950/20 dark:bg-emerald-950/30 border-emerald-800/40 dark:border-emerald-800/30'
                      : 'bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700',
                  ].join(' ')}
                >
                  {/* Custom checkbox */}
                  <div className={[
                    'w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all',
                    checked[item.id]
                      ? 'bg-emerald-500 border-emerald-500'
                      : 'border-zinc-300 dark:border-zinc-700',
                  ].join(' ')}>
                    {checked[item.id] && (
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5">
                        <polyline points="2,6 5,9 10,3" />
                      </svg>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm ${checked[item.id] ? 'text-emerald-300 line-through decoration-emerald-600' : 'text-zinc-900 dark:text-zinc-100'}`}>
                      {item.drug_name}
                    </p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-0.5">
                      {item.drug_code} · {item.quantity}개 · {item.days}일
                    </p>
                  </div>
                  <span className={`text-sm font-medium flex-shrink-0 ${checked[item.id] ? 'text-emerald-500 dark:text-emerald-400' : 'text-zinc-600 dark:text-zinc-400'}`}>
                    {(item.unit_price * item.quantity * item.days).toLocaleString()}원
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleComplete}
              disabled={!allChecked || submitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#246AFE] hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-40"
            >
              {submitting && <Spinner size="sm" className="text-white" />}
              {submitting ? '처리 중' : '조제 완료 — 검토로'}
            </button>
          </div>
        </>
      )}

      {visitId && !loading && !prescriptionError && !prescription && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 text-center text-zinc-400 dark:text-zinc-600 text-sm">
          처방 정보가 없습니다.
        </div>
      )}
    </div>
  )
}
