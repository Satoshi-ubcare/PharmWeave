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

  const handleComplete = async () => {
    if (!visitId || !allChecked) return
    await transition(visitId, 'review')
    setStage('review')
    navigate('/review')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <span>💊</span> 조제
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">대기 환자를 선택하면 처방 항목이 표시됩니다.</p>
      </div>

      <StagePatientList stage="dispensing" />

      {!visitId && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center text-gray-400 dark:text-gray-500 text-sm shadow-sm">
          위 목록에서 조제할 환자를 선택하세요.
        </div>
      )}

      {visitId && loading && (
        <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 text-sm py-4">
          <Spinner size="md" className="text-gray-400" />
          <span>처방 정보를 불러오는 중...</span>
        </div>
      )}

      {visitId && !loading && prescription && (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-800 dark:text-gray-200">
                🏥 {prescription.clinic_name} — {String(prescription.prescribed_at).slice(0, 10)}
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                {Object.values(checked).filter(Boolean).length} / {prescription.items.length} 확인
              </span>
            </div>
            <ul className="space-y-3">
              {prescription.items.map((item) => (
                <li
                  key={item.id}
                  className={[
                    'flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer',
                    checked[item.id]
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                      : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/20',
                  ].join(' ')}
                  onClick={() => setChecked({ ...checked, [item.id]: !checked[item.id] })}
                >
                  <input
                    type="checkbox"
                    checked={checked[item.id] ?? false}
                    onChange={() => {}}
                    className="w-5 h-5 accent-blue-600"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-gray-100">💊 {item.drug_name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.drug_code} · {item.quantity}개 · {item.days}일</p>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                    {(item.unit_price * item.quantity * item.days).toLocaleString()}원
                  </span>
                  {checked[item.id] && <span className="text-green-500 dark:text-green-400">✅</span>}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleComplete}
              disabled={!allChecked || submitting}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-md"
            >
              {submitting && <Spinner className="text-white" />}
              {submitting ? '처리 중...' : '✅ 조제 완료 → 검토'}
            </button>
          </div>
        </>
      )}

      {visitId && !loading && !prescriptionError && !prescription && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center text-gray-400 dark:text-gray-500 text-sm shadow-sm">
          처방 정보가 없습니다.
        </div>
      )}
    </div>
  )
}
