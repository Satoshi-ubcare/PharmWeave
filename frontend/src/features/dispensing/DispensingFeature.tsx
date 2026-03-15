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
        <h1 className="text-2xl font-bold text-gray-900">조제</h1>
        <p className="text-gray-500 text-sm mt-1">대기 환자를 선택하면 처방 항목이 표시됩니다.</p>
      </div>

      <StagePatientList stage="dispensing" />

      {/* 환자 미선택 */}
      {!visitId && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400 text-sm">
          위 목록에서 조제할 환자를 선택하세요.
        </div>
      )}

      {/* 처방 로딩 중 */}
      {visitId && loading && (
        <div className="flex items-center gap-2 text-gray-400 text-sm py-4">
          <Spinner size="md" className="text-gray-400" />
          <span>처방 정보를 불러오는 중...</span>
        </div>
      )}

      {/* 처방 로드 후 내용 */}
      {visitId && !loading && prescription && (
        <>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-800">
                {prescription.clinic_name} — {String(prescription.prescribed_at).slice(0, 10)}
              </h2>
              <span className="text-sm text-gray-500">
                {Object.values(checked).filter(Boolean).length} / {prescription.items.length} 확인
              </span>
            </div>
            <ul className="space-y-3">
              {prescription.items.map((item) => (
                <li
                  key={item.id}
                  className={[
                    'flex items-center gap-4 p-4 rounded-lg border transition-colors cursor-pointer',
                    checked[item.id]
                      ? 'bg-green-50 border-green-200'
                      : 'bg-gray-50 border-gray-200 hover:bg-blue-50',
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
                    <p className="font-medium text-gray-900">{item.drug_name}</p>
                    <p className="text-xs text-gray-500">{item.drug_code} · {item.quantity}개 · {item.days}일</p>
                  </div>
                  <span className="text-sm text-gray-600">
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
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {submitting && <Spinner className="text-white" />}
              {submitting ? '처리 중...' : '조제 완료 → 검토'}
            </button>
          </div>
        </>
      )}

      {/* 처방 없음 */}
      {visitId && !loading && !prescriptionError && !prescription && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400 text-sm">
          처방 정보가 없습니다.
        </div>
      )}
    </div>
  )
}
