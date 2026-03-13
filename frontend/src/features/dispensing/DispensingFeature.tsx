import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { prescriptionApi, visitApi } from '@/api/endpoints'
import { useWorkflowStore } from '@/stores/workflowStore'
import type { Prescription } from '@/types'

export default function DispensingFeature() {
  const navigate = useNavigate()
  const { visitId, setStage } = useWorkflowStore()
  const [prescription, setPrescription] = useState<Prescription | null>(null)
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!visitId) return
    prescriptionApi.get(visitId).then((res) => {
      setPrescription(res.data)
      const init: Record<string, boolean> = {}
      res.data.items.forEach((item) => { init[item.id] = false })
      setChecked(init)
    }).finally(() => setLoading(false))
  }, [visitId])

  const allChecked = prescription
    ? prescription.items.every((item) => checked[item.id])
    : false

  const handleComplete = async () => {
    if (!visitId || !allChecked) return
    setSubmitting(true)
    try {
      await visitApi.transitionStage(visitId, 'review')
      setStage('review')
      navigate('/review')
    } finally {
      setSubmitting(false)
    }
  }

  if (!visitId) return <p className="text-gray-500">먼저 접수 단계에서 방문을 시작해주세요.</p>
  if (loading) return <p className="text-gray-400 text-sm">처방 정보를 불러오는 중...</p>
  if (!prescription) return <p className="text-gray-500">처방 정보가 없습니다.</p>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">조제</h1>
        <p className="text-gray-500 text-sm mt-1">처방 항목을 하나씩 확인하고 체크하세요.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">
            {prescription.clinic_name} — {prescription.prescribed_at}
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
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {submitting ? '처리 중...' : '조제 완료 → 검토'}
        </button>
      </div>
    </div>
  )
}
