import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { prescriptionApi, visitApi } from '@/api/endpoints'
import { useWorkflowStore } from '@/stores/workflowStore'
import type { Prescription } from '@/types'

export default function ReviewFeature() {
  const navigate = useNavigate()
  const { visitId, patient, setStage } = useWorkflowStore()
  const [prescription, setPrescription] = useState<Prescription | null>(null)
  const [memo, setMemo] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!visitId) return
    prescriptionApi.get(visitId).then((res) => setPrescription(res.data))
  }, [visitId])

  const totalCost = prescription?.items.reduce(
    (sum, item) => sum + item.unit_price * item.quantity * item.days,
    0,
  ) ?? 0

  const handleApprove = async () => {
    if (!visitId) return
    setSubmitting(true)
    try {
      await visitApi.transitionStage(visitId, 'payment')
      setStage('payment')
      navigate('/payment')
    } finally {
      setSubmitting(false)
    }
  }

  if (!visitId) return <p className="text-gray-500">먼저 접수 단계에서 방문을 시작해주세요.</p>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">검토</h1>
        <p className="text-gray-500 text-sm mt-1">처방 내용을 최종 확인합니다.</p>
      </div>

      {patient && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-800 mb-3">환자 정보</h2>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div><span className="text-gray-500">이름</span><p className="font-medium mt-0.5">{patient.name}</p></div>
            <div><span className="text-gray-500">생년월일</span><p className="font-medium mt-0.5">{patient.birth_date}</p></div>
            <div><span className="text-gray-500">연락처</span><p className="font-medium mt-0.5">{patient.phone ?? '—'}</p></div>
          </div>
        </div>
      )}

      {prescription && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-800 mb-3">처방 요약</h2>
          <p className="text-sm text-gray-500 mb-4">{prescription.clinic_name} · {prescription.prescribed_at}</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 text-xs border-b border-gray-100">
                <th className="text-left pb-2">약품명</th>
                <th className="text-center pb-2">수량</th>
                <th className="text-center pb-2">일수</th>
                <th className="text-right pb-2">금액</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {prescription.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-2 font-medium">{item.drug_name}</td>
                  <td className="py-2 text-center">{item.quantity}</td>
                  <td className="py-2 text-center">{item.days}</td>
                  <td className="py-2 text-right">{(item.unit_price * item.quantity * item.days).toLocaleString()}원</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-gray-200 font-semibold">
                <td colSpan={3} className="pt-3 text-gray-700">약제비 합계</td>
                <td className="pt-3 text-right text-blue-700">{totalCost.toLocaleString()}원</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-800 mb-2">검토 메모 (선택)</h2>
        <textarea
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          rows={3}
          placeholder="특이사항 또는 주의사항을 입력하세요..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleApprove}
          disabled={submitting}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {submitting ? '처리 중...' : '검토 승인 → 수납'}
        </button>
      </div>
    </div>
  )
}
