import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWorkflowStore } from '@/stores/workflowStore'
import { usePrescription } from '@/hooks/usePrescription'
import { useWorkflowStage } from '@/hooks/useVisit'
import { useToast } from '@/hooks/useToast'
import { useAutoScroll } from '@/hooks/useAutoScroll'
import StagePatientList from '@/components/StagePatientList'
import PluginSlot from '@/components/PluginSlot'
import Spinner from '@/components/ui/Spinner'

export default function ReviewFeature() {
  const navigate = useNavigate()
  const { visitId, patient, setStage } = useWorkflowStore()
  const { prescription, loading: prescriptionLoading, error: prescriptionError } = usePrescription(visitId)
  const { loading: submitting, error: stageError, transition } = useWorkflowStage()
  const { toast } = useToast()
  const [memo, setMemo] = useState('')
  const itemCount = prescription?.items.length ?? 0
  const tableScroll = useAutoScroll<HTMLDivElement>(itemCount, 5)

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
      <div className="space-y-1">
        <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-blue-600 dark:text-blue-400">
          Step 04
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">검토</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-500">대기 환자를 선택하면 처방 내용이 표시됩니다.</p>
      </div>

      <StagePatientList stage="review" />

      {!visitId && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 text-center text-zinc-400 dark:text-zinc-600 text-sm">
          위 목록에서 검토할 환자를 선택하세요.
        </div>
      )}

      {/* 환자 정보 */}
      {patient && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 space-y-3">
          <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-blue-600 dark:text-blue-400">
            환자 정보
          </p>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-xs text-zinc-400 dark:text-zinc-600 block mb-1">이름</span>
              <p className="font-medium text-zinc-900 dark:text-zinc-100">{patient.name}</p>
            </div>
            <div>
              <span className="text-xs text-zinc-400 dark:text-zinc-600 block mb-1">생년월일</span>
              <p className="font-medium text-zinc-900 dark:text-zinc-100">{String(patient.birth_date).slice(0, 10)}</p>
            </div>
            <div>
              <span className="text-xs text-zinc-400 dark:text-zinc-600 block mb-1">연락처</span>
              <p className="font-medium text-zinc-900 dark:text-zinc-100">{patient.phone ?? '—'}</p>
            </div>
          </div>
        </div>
      )}

      {visitId && prescriptionLoading && (
        <div className="flex items-center gap-3 text-zinc-400 dark:text-zinc-600 text-sm py-4">
          <Spinner size="md" className="text-zinc-400" />
          <span>처방 정보를 불러오는 중...</span>
        </div>
      )}

      {/* 처방 요약 */}
      {prescription && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-blue-600 dark:text-blue-400">
              처방 요약
            </p>
            <span className="text-xs text-zinc-400 dark:text-zinc-600">
              {prescription.clinic_name} · {String(prescription.prescribed_at).slice(0, 10)}
            </span>
          </div>
          <div
            ref={tableScroll.ref}
            onMouseEnter={tableScroll.onMouseEnter}
            onMouseLeave={tableScroll.onMouseLeave}
            className="overflow-y-auto max-h-[240px]"
          >
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-white dark:bg-zinc-900">
              <tr className="text-[10px] tracking-[0.1em] uppercase text-zinc-400 dark:text-zinc-600 border-b border-zinc-100 dark:border-zinc-800">
                <th className="text-left py-3">약품명</th>
                <th className="text-center py-3">수량</th>
                <th className="text-center py-3">일수</th>
                <th className="text-right py-3">금액</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
              {prescription.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-3 font-medium text-zinc-900 dark:text-zinc-100">{item.drug_name}</td>
                  <td className="py-3 text-center text-zinc-600 dark:text-zinc-400">{item.quantity}</td>
                  <td className="py-3 text-center text-zinc-600 dark:text-zinc-400">{item.days}</td>
                  <td className="py-3 text-right text-zinc-600 dark:text-zinc-400">
                    {(item.unit_price * item.quantity * item.days).toLocaleString()}원
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <span className="text-xs text-zinc-400 dark:text-zinc-600 font-medium">약제비 합계</span>
            <span className="font-bold text-blue-700 dark:text-blue-400">
              {totalCost.toLocaleString()}원
            </span>
          </div>
        </div>
      )}

      {/* Plugin 검사 */}
      {visitId && (
        <div className="space-y-3">
          <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-blue-600 dark:text-blue-400">
            Plugin 검사
          </p>
          <PluginSlot key={`dur-${visitId}`} pluginId="dur" visitId={visitId} />
          <PluginSlot key={`mg-${visitId}`} pluginId="medication-guide" visitId={visitId} />
        </div>
      )}

      {/* 검토 메모 */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 space-y-3">
        <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-blue-600 dark:text-blue-400">
          검토 메모 <span className="text-zinc-400 font-normal normal-case tracking-normal">(선택)</span>
        </p>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          rows={3}
          placeholder="특이사항 또는 주의사항을 입력하세요..."
          className="w-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-[#0B0A0A] dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors resize-none"
        />
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleApprove}
          disabled={submitting}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#246AFE] hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-40"
        >
          {submitting && <Spinner size="sm" className="text-white" />}
          {submitting ? '처리 중' : '검토 승인 — 수납으로'}
        </button>
      </div>
    </div>
  )
}
