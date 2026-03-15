import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useWorkflowStore } from '@/stores/workflowStore'
import { usePrescription } from '@/hooks/usePrescription'
import { usePaymentCreate } from '@/hooks/usePayment'
import { useWorkflowStage } from '@/hooks/useVisit'
import { useToast } from '@/hooks/useToast'
import StagePatientList from '@/components/StagePatientList'
import Spinner from '@/components/ui/Spinner'

function calcCopay(totalDrugCost: number): { copayAmount: number; insuranceCoverage: number } {
  const rate = totalDrugCost < 10000 ? 0.2 : 0.3
  const copayAmount = Math.round(totalDrugCost * rate)
  return { copayAmount, insuranceCoverage: totalDrugCost - copayAmount }
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <span>💳</span> 수납
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">대기 환자를 선택하면 본인부담금이 표시됩니다.</p>
      </div>

      <StagePatientList stage="payment" />

      {!visitId && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center text-gray-400 dark:text-gray-500 text-sm shadow-sm">
          위 목록에서 수납할 환자를 선택하세요.
        </div>
      )}

      {visitId && (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4 shadow-sm">
            <h2 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <span>💰</span> 본인부담금 계산
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400">약제비 합계</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{totalDrugCost.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                <span className="text-gray-500 dark:text-gray-400">
                  본인부담율 ({totalDrugCost < 10000 ? '20%' : '30%'})
                </span>
                <span className="font-medium text-orange-600 dark:text-orange-400">{copayAmount.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-500 dark:text-gray-400">건강보험 부담</span>
                <span className="font-medium text-blue-600 dark:text-blue-400">{insuranceCoverage.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-gray-200 dark:border-gray-600">
                <span className="font-bold text-gray-800 dark:text-gray-200 text-base">💳 환자 납부금액</span>
                <span className="font-bold text-blue-700 dark:text-blue-400 text-xl">{copayAmount.toLocaleString()}원</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-3 shadow-sm">
            <h2 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <span>🏦</span> 결제 방법
            </h2>
            <div className="flex gap-3">
              {(['card', 'cash', 'transfer'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMethod(m)}
                  className={[
                    'flex-1 py-3 rounded-xl border text-sm font-medium transition-all',
                    method === m
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-105'
                      : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700',
                  ].join(' ')}
                >
                  {m === 'card' ? '💳 카드' : m === 'cash' ? '💵 현금' : '🏦 계좌이체'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handlePay}
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-md"
            >
              {submitting && <Spinner className="text-white" />}
              {submitting ? '처리 중...' : `💳 ${copayAmount.toLocaleString()}원 결제 → 청구`}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
