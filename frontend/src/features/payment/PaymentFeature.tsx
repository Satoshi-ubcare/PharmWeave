import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { useWorkflowStore } from '@/stores/workflowStore'
import { usePrescription } from '@/hooks/usePrescription'
import { usePaymentCreate } from '@/hooks/usePayment'
import { useWorkflowStage } from '@/hooks/useVisit'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/lib/cn'
import StagePatientList from '@/components/StagePatientList'
import Spinner from '@/components/ui/Spinner'
import type { InsuranceType, CopayExemption } from '@/types'
import { INSURANCE_TYPE_LABELS, COPAY_EXEMPTION_LABELS } from '@/types'

function calcCopay(
  totalDrugCost: number,
  insuranceType: InsuranceType = 'health_insurance',
  copayExemption: CopayExemption = 'none',
): { copayAmount: number; insuranceCoverage: number; rateLabel: string } {
  let copayAmount: number
  let rateLabel: string

  switch (insuranceType) {
    case 'medical_aid_1':
      copayAmount = Math.min(500, totalDrugCost)
      rateLabel = '500원 정액'
      break
    case 'medical_aid_2':
      copayAmount = Math.round(totalDrugCost * 0.15)
      rateLabel = '15%'
      break
    case 'veterans':
    case 'industrial_accident':
    case 'auto_insurance':
      copayAmount = 0
      rateLabel = '전액 면제'
      break
    case 'self_pay':
      copayAmount = totalDrugCost
      rateLabel = '100% (비급여)'
      break
    default: { // health_insurance
      switch (copayExemption) {
        case 'infant':
          copayAmount = 0; rateLabel = '무료 (영유아)'; break
        case 'elderly':
          if (totalDrugCost < 10_000) { copayAmount = 0; rateLabel = '무료 (노인)' }
          else if (totalDrugCost < 15_000) { copayAmount = 1_500; rateLabel = '1,500원 정액 (노인)' }
          else { copayAmount = Math.round(totalDrugCost * 0.1); rateLabel = '10% (노인)' }
          break
        case 'disabled':
        case 'pregnant':
          copayAmount = Math.round(totalDrugCost * 0.2)
          rateLabel = `20% (${COPAY_EXEMPTION_LABELS[copayExemption]})`
          break
        case 'rare_disease':
          copayAmount = Math.round(totalDrugCost * 0.1)
          rateLabel = '10% (희귀질환)'
          break
        default:
          copayAmount = Math.round(totalDrugCost * (totalDrugCost < 10_000 ? 0.2 : 0.3))
          rateLabel = totalDrugCost < 10_000 ? '20%' : '30%'
      }
    }
  }

  return { copayAmount, insuranceCoverage: totalDrugCost - copayAmount, rateLabel }
}

const METHOD_LABELS: Record<string, string> = {
  card: '카드',
  cash: '현금',
  transfer: '계좌이체',
}

export default function PaymentFeature() {
  const navigate = useNavigate()
  const { visitId, setStage, patient } = useWorkflowStore()
  const { prescription, error: prescriptionError } = usePrescription(visitId)
  const { loading: submitting, error: payError, process } = usePaymentCreate()
  const { error: stageError, transition } = useWorkflowStage()
  const { toast } = useToast()
  const [method, setMethod] = useState<'cash' | 'card' | 'transfer'>('card')
  const [simInsurance, setSimInsurance] = useState<InsuranceType>('health_insurance')
  const [simExemption] = useState<CopayExemption>('none')

  useEffect(() => { setMethod('card') }, [visitId])
  useEffect(() => {
    setSimInsurance((patient?.insurance_type ?? 'health_insurance') as InsuranceType)
  }, [visitId, patient])
  useEffect(() => { if (payError) toast('error', payError) }, [payError, toast])
  useEffect(() => { if (stageError) toast('error', stageError) }, [stageError, toast])
  useEffect(() => { if (prescriptionError) toast('error', prescriptionError) }, [prescriptionError, toast])

  const totalDrugCost = prescription?.items.reduce(
    (sum, item) => sum + item.unit_price * item.quantity * item.days,
    0,
  ) ?? 0

  const actualInsuranceType = (patient?.insurance_type ?? 'health_insurance') as InsuranceType
  const copayExemption = (patient?.copay_exemption ?? 'none') as CopayExemption
  const isSimulating = simInsurance !== actualInsuranceType
  const { copayAmount, insuranceCoverage, rateLabel } = calcCopay(totalDrugCost, simInsurance, simExemption)

  // countUp animation for copayAmount
  const [displayCopay, setDisplayCopay] = useState(copayAmount)
  const prevCopayRef = useRef(copayAmount)
  useEffect(() => {
    const start = prevCopayRef.current
    const end = copayAmount
    prevCopayRef.current = end
    if (start === end) return
    const duration = 450
    const startTime = performance.now()
    const animate = (now: number) => {
      const t = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplayCopay(Math.round(start + (end - start) * eased))
      if (t < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [copayAmount])

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
        <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-blue-600 dark:text-blue-400">
          Step 05
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">수납</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-500">대기 환자를 선택하면 본인부담금이 표시됩니다.</p>
      </div>

      <StagePatientList stage="payment" />

      {!visitId && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-8 text-center text-zinc-400 dark:text-zinc-600 text-sm">
          위 목록에서 수납할 환자를 선택하세요.
        </div>
      )}

      {visitId && (
        <>
          {/* 본인부담금 계산 */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-blue-600 dark:text-blue-400">
                본인부담금 계산
              </p>
              {isSimulating && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40">
                  ⚡ 시뮬레이션 모드
                </span>
              )}
            </div>

            {/* 보험 유형 선택 (인터랙티브) */}
            <div className="space-y-2">
              <p className="text-xs text-zinc-400 dark:text-zinc-600">보험 유형 선택</p>
              <div className="flex flex-wrap gap-2">
                {(Object.entries(INSURANCE_TYPE_LABELS) as [InsuranceType, string][]).map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => setSimInsurance(val)}
                    className={cn(
                      'px-3 py-1.5 rounded-xl border text-xs font-medium transition-all',
                      simInsurance === val
                        ? 'border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-300'
                        : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-600',
                      val === actualInsuranceType && simInsurance !== val
                        ? 'border-dashed'
                        : '',
                    )}
                  >
                    {label}
                    {val === actualInsuranceType && (
                      <span className="ml-1 text-[9px] text-blue-500 dark:text-blue-400">●</span>
                    )}
                  </button>
                ))}
              </div>
              {isSimulating && (
                <p className="text-[11px] text-amber-600 dark:text-amber-500">
                  ● 표시가 등록된 실제 보험. 결제 시 실제 보험이 적용됩니다.
                </p>
              )}
            </div>

            <div className="space-y-0 border-t border-zinc-100 dark:border-zinc-800 pt-3">
              <div className="flex justify-between items-center py-3 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-sm text-zinc-500 dark:text-zinc-500">약제비 합계</span>
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 tabular-nums">
                  {totalDrugCost.toLocaleString()}원
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-sm text-zinc-500 dark:text-zinc-500">
                  본인부담율
                  <span className="text-xs text-zinc-400 dark:text-zinc-600 ml-1.5">({rateLabel})</span>
                </span>
                <span className="text-sm font-medium text-blue-700 dark:text-blue-400 tabular-nums">
                  {copayAmount.toLocaleString()}원
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-sm text-zinc-500 dark:text-zinc-500">보험/기관 부담</span>
                <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {insuranceCoverage.toLocaleString()}원
                </span>
              </div>

              {/* 최종 금액 — countUp */}
              <div className="flex justify-between items-center pt-4">
                <span className="text-xs font-semibold tracking-[0.15em] uppercase text-zinc-500 dark:text-zinc-500">
                  환자 납부금액
                </span>
                <span className="text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400 tabular-nums transition-colors">
                  {displayCopay.toLocaleString()}
                  <span className="text-sm font-medium ml-1">원</span>
                </span>
              </div>
            </div>
          </div>

          {/* 결제 방법 */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 space-y-4">
            <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-blue-600 dark:text-blue-400">
              결제 방법
            </p>
            <div className="grid grid-cols-3 gap-3">
              {(['card', 'cash', 'transfer'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMethod(m)}
                  className={cn(
                    'py-3 rounded-xl border text-sm font-medium transition-all',
                    method === m
                      ? 'border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-300'
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
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#246AFE] hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-40"
            >
              {submitting && <Spinner size="sm" className="text-white" />}
              {submitting ? '처리 중' : `${calcCopay(totalDrugCost, actualInsuranceType, copayExemption).copayAmount.toLocaleString()}원 결제 — 청구로`}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
