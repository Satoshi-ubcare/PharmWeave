import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useWorkflowStore } from '@/stores/workflowStore'
import { usePrescription } from '@/hooks/usePrescription'
import { usePaymentCreate } from '@/hooks/usePayment'
import { useWorkflowStage } from '@/hooks/useVisit'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/lib/cn'
import StagePatientList from '@/components/StagePatientList'
import Spinner from '@/components/ui/Spinner'

function calcCopay(totalDrugCost: number): { copayAmount: number; insuranceCoverage: number } {
  const rate = totalDrugCost < 10000 ? 0.2 : 0.3
  const copayAmount = Math.round(totalDrugCost * rate)
  return { copayAmount, insuranceCoverage: totalDrugCost - copayAmount }
}

const METHOD_LABELS: Record<string, string> = {
  card: '카드',
  cash: '현금',
  transfer: '계좌이체',
}

export default function PaymentFeature() {
  const navigate = useNavigate()
  const { visitId, setStage } = useWorkflowStore()
  const { prescription, error: prescriptionError } = usePrescription(visitId)
  const { loading: submitting, error: payError, process } = usePaymentCreate()
  const { error: stageError, transition } = useWorkflowStage()
  const { toast } = useToast()
  const [method, setMethod] = useState<'cash' | 'card' | 'transfer'>('card')

  useEffect(() => { setMethod('card') }, [visitId])
  useEffect(() => { if (payError) toast('error', payError) }, [payError, toast])
  useEffect(() => { if (stageError) toast('error', stageError) }, [stageError, toast])
  useEffect(() => { if (prescriptionError) toast('error', prescriptionError) }, [prescriptionError, toast])

  const totalDrugCost = prescription?.items.reduce(
    (sum, item) => sum + item.unit_price * item.quantity * item.days,
    0,
  ) ?? 0

  const { copayAmount, insuranceCoverage } = calcCopay(totalDrugCost)

  const handlePay = async () => {
    if (!visitId) return
    const payment = await process(visitId, method)
    if (!payment) return
    toast('success', '수납이 처리되었습니다.')
    await transition(visitId, 'claim')
    setStage('claim')
    navigate('/claim')
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-amber-500 dark:text-amber-400">
          Step 05
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">수납</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-500">대기 환자를 선택하면 본인부담금이 표시됩니다.</p>
      </div>

      <StagePatientList stage="payment" />

      {!visitId && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-8 text-center text-zinc-400 dark:text-zinc-600 text-sm">
          위 목록에서 수납할 환자를 선택하세요.
        </div>
      )}

      {visitId && (
        <>
          {/* 본인부담금 계산 */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-6 space-y-4">
            <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-amber-500 dark:text-amber-400">
              본인부담금 계산
            </p>
            <div className="space-y-0">
              <div className="flex justify-between items-center py-3 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-sm text-zinc-500 dark:text-zinc-500">약제비 합계</span>
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {totalDrugCost.toLocaleString()}원
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-sm text-zinc-500 dark:text-zinc-500">
                  본인부담율
                  <span className="text-xs text-zinc-400 dark:text-zinc-600 ml-1.5">
                    ({totalDrugCost < 10000 ? '20%' : '30%'})
                  </span>
                </span>
                <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                  {copayAmount.toLocaleString()}원
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-sm text-zinc-500 dark:text-zinc-500">건강보험 부담</span>
                <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  {insuranceCoverage.toLocaleString()}원
                </span>
              </div>

              {/* 최종 금액 */}
              <div className="flex justify-between items-center pt-4">
                <span className="text-xs font-semibold tracking-[0.15em] uppercase text-zinc-500 dark:text-zinc-500">
                  환자 납부금액
                </span>
                <span className="text-2xl font-bold tracking-tight text-amber-500 dark:text-amber-400">
                  {copayAmount.toLocaleString()}
                  <span className="text-sm font-medium ml-1">원</span>
                </span>
              </div>
            </div>
          </div>

          {/* 결제 방법 */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-6 space-y-4">
            <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-amber-500 dark:text-amber-400">
              결제 방법
            </p>
            <div className="grid grid-cols-3 gap-3">
              {(['card', 'cash', 'transfer'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMethod(m)}
                  className={cn(
                    'py-3 rounded border text-sm font-medium transition-all',
                    method === m
                      ? 'border-amber-400 bg-amber-400/10 text-amber-600 dark:text-amber-300'
                      : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-600',
                  )}
                >
                  {METHOD_LABELS[m]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handlePay}
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-zinc-950 text-sm font-semibold rounded transition-colors disabled:opacity-40"
            >
              {submitting && <Spinner size="sm" className="text-zinc-950" />}
              {submitting ? '처리 중' : `${copayAmount.toLocaleString()}원 결제 — 청구로`}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
