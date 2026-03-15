import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWorkflowStore } from '@/stores/workflowStore'
import { usePrescription } from '@/hooks/usePrescription'
import { useWorkflowStage } from '@/hooks/useVisit'
import { useToast } from '@/hooks/useToast'
import StagePatientList from '@/components/StagePatientList'
import PluginSlot from '@/components/PluginSlot'
import Spinner from '@/components/ui/Spinner'

export default function ReviewFeature() {
  const navigate = useNavigate()
  const { visitId, patient, setStage } = useWorkflowStore()
  const { prescription, error: prescriptionError } = usePrescription(visitId)
  const { loading: submitting, error: stageError, transition } = useWorkflowStage()
  const { toast } = useToast()
  const [memo, setMemo] = useState('')

  useEffect(() => { setMemo('') }, [visitId])
  useEffect(() => { if (stageError) toast('error', stageError) }, [stageError, toast])
  useEffect(() => { if (prescriptionError) toast('error', prescriptionError) }, [prescriptionError, toast])

  const totalCost = prescription?.items.reduce(
    (sum, item) => sum + item.unit_price * item.quantity * item.days,
    0,
  ) ?? 0

  const handleApprove = async () => {
    if (!visitId) return
    await transition(visitId, 'payment')
    setStage('payment')
    navigate('/payment')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <span>🔬</span> 검토
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">대기 환자를 선택하면 처방 내용이 표시됩니다.</p>
      </div>

      <StagePatientList stage="review" />

      {!visitId && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center text-gray-400 dark:text-gray-500 text-sm shadow-sm">
          위 목록에서 검토할 환자를 선택하세요.
        </div>
      )}

      {patient && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <h2 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
            <span>👤</span> 환자 정보
          </h2>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">이름</span>
              <p className="font-medium mt-0.5 text-gray-900 dark:text-gray-100">{patient.name}</p>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">생년월일</span>
              <p className="font-medium mt-0.5 text-gray-900 dark:text-gray-100">{String(patient.birth_date).slice(0, 10)}</p>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">연락처</span>
              <p className="font-medium mt-0.5 text-gray-900 dark:text-gray-100">{patient.phone ?? '—'}</p>
            </div>
          </div>
        </div>
      )}

      {prescription && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <h2 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
            <span>📋</span> 처방 요약
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">🏥 {prescription.clinic_name} · {String(prescription.prescribed_at).slice(0, 10)}</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 dark:text-gray-500 text-xs border-b border-gray-100 dark:border-gray-700">
                <th className="text-left pb-2">약품명</th>
                <th className="text-center pb-2">수량</th>
                <th className="text-center pb-2">일수</th>
                <th className="text-right pb-2">금액</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {prescription.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-2 font-medium text-gray-900 dark:text-gray-100">💊 {item.drug_name}</td>
                  <td className="py-2 text-center text-gray-700 dark:text-gray-300">{item.quantity}</td>
                  <td className="py-2 text-center text-gray-700 dark:text-gray-300">{item.days}</td>
                  <td className="py-2 text-right text-gray-700 dark:text-gray-300">{(item.unit_price * item.quantity * item.days).toLocaleString()}원</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-gray-200 dark:border-gray-600 font-semibold">
                <td colSpan={3} className="pt-3 text-gray-700 dark:text-gray-300">💰 약제비 합계</td>
                <td className="pt-3 text-right text-blue-700 dark:text-blue-400">{totalCost.toLocaleString()}원</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {visitId && (
        <div className="space-y-3">
          <h2 className="font-semibold text-gray-700 dark:text-gray-300 text-sm flex items-center gap-1.5">
            <span>🔌</span> Plugin 검사
          </h2>
          <PluginSlot key={`dur-${visitId}`} pluginId="dur" visitId={visitId} />
          <PluginSlot key={`mg-${visitId}`} pluginId="medication-guide" visitId={visitId} />
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
        <h2 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
          <span>📝</span> 검토 메모 (선택)
        </h2>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          rows={3}
          placeholder="특이사항 또는 주의사항을 입력하세요..."
          className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleApprove}
          disabled={submitting}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-md"
        >
          {submitting && <Spinner className="text-white" />}
          {submitting ? '처리 중...' : '✅ 검토 승인 → 수납'}
        </button>
      </div>
    </div>
  )
}
