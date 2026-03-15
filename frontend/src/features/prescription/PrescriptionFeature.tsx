import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWorkflowStore } from '@/stores/workflowStore'
import { usePrescriptionSave, useDrugSearch } from '@/hooks/usePrescription'
import { useWorkflowStage } from '@/hooks/useVisit'
import { useToast } from '@/hooks/useToast'
import StagePatientList from '@/components/StagePatientList'
import Spinner from '@/components/ui/Spinner'
import type { Drug } from '@/types'

interface ItemInput {
  drug_code: string
  drug_name: string
  unit_price: number
  quantity: number
  days: number
}

export default function PrescriptionFeature() {
  const navigate = useNavigate()
  const { visitId, setStage } = useWorkflowStore()
  const { toast } = useToast()

  const [clinicName, setClinicName] = useState('')
  const [doctorName, setDoctorName] = useState('')
  const [prescribedAt, setPrescribedAt] = useState(new Date().toISOString().split('T')[0])
  const [items, setItems] = useState<ItemInput[]>([])

  const [drugQuery, setDrugQuery] = useState('')
  const [showDrugDropdown, setShowDrugDropdown] = useState(false)
  const [error, setError] = useState('')
  const drugDropdownRef = useRef<HTMLDivElement>(null)

  const { results: drugResults, loading: drugSearching, search: searchDrug, clear: clearDrug } = useDrugSearch()
  const { loading: saving, error: saveError, save } = usePrescriptionSave()
  const { error: stageError, transition } = useWorkflowStage()

  useEffect(() => { if (saveError) toast('error', saveError) }, [saveError, toast])
  useEffect(() => { if (stageError) toast('error', stageError) }, [stageError, toast])

  useEffect(() => {
    setClinicName('')
    setDoctorName('')
    setPrescribedAt(new Date().toISOString().split('T')[0])
    setItems([])
    setDrugQuery('')
    setShowDrugDropdown(false)
    setError('')
    clearDrug()
  }, [visitId, clearDrug])

  useEffect(() => {
    if (drugQuery.trim().length < 1) {
      clearDrug()
      setShowDrugDropdown(false)
      return
    }
    const timer = setTimeout(() => {
      searchDrug(drugQuery)
      setShowDrugDropdown(true)
    }, 300)
    return () => clearTimeout(timer)
  }, [drugQuery, searchDrug, clearDrug])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (drugDropdownRef.current && !drugDropdownRef.current.contains(e.target as Node)) {
        setShowDrugDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const addItem = (drug: Drug) => {
    if (items.find((i) => i.drug_code === drug.drug_code)) return
    setItems([...items, { drug_code: drug.drug_code, drug_name: drug.drug_name, unit_price: drug.unit_price, quantity: 1, days: 1 }])
    clearDrug()
    setDrugQuery('')
    setShowDrugDropdown(false)
  }

  const updateItem = (idx: number, field: keyof ItemInput, value: number) => {
    setItems(items.map((item, i) => i === idx ? { ...item, [field]: value } : item))
  }

  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx))

  const handleSave = async () => {
    if (!visitId || !clinicName || items.length === 0) {
      setError('의료기관명과 처방 항목 1개 이상이 필요합니다.')
      return
    }
    setError('')
    const result = await save(visitId, {
      clinic_name: clinicName,
      doctor_name: doctorName || undefined,
      prescribed_at: prescribedAt,
      items,
    })
    if (!result) return
    toast('success', '처방이 저장되었습니다.')
    await transition(visitId, 'dispensing')
    setStage('dispensing')
    navigate('/dispensing')
  }

  if (!visitId) {
    return <p className="text-gray-500 dark:text-gray-400">먼저 접수 단계에서 방문을 시작해주세요.</p>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <span>📋</span> 처방
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">처방전 정보와 약품 항목을 입력합니다.</p>
      </div>

      <StagePatientList stage="prescription" />

      {/* 처방전 정보 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4 shadow-sm">
        <h2 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
          <span>🏥</span> 처방전 정보
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">의료기관명 *</label>
            <input
              type="text"
              value={clinicName}
              onChange={(e) => setClinicName(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">처방 의사명</label>
            <input
              type="text"
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">처방일 *</label>
            <input
              type="date"
              value={prescribedAt}
              onChange={(e) => setPrescribedAt(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* 약품 검색 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4 shadow-sm">
        <h2 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
          <span>💊</span> 약품 추가
        </h2>
        <div className="relative" ref={drugDropdownRef}>
          <input
            type="text"
            value={drugQuery}
            onChange={(e) => setDrugQuery(e.target.value)}
            onFocus={() => drugResults.length > 0 && setShowDrugDropdown(true)}
            placeholder="약품명 또는 코드 입력 시 자동 검색"
            className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400 rounded-lg px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {drugSearching && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">검색 중…</span>
          )}

          {showDrugDropdown && drugResults.length > 0 && (
            <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden divide-y divide-gray-100 dark:divide-gray-700 max-h-60 overflow-y-auto">
              {drugResults.map((drug) => (
                <li key={drug.id}>
                  <button
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => addItem(drug)}
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-sm transition-colors"
                  >
                    <span className="font-medium text-gray-900 dark:text-gray-100">💊 {drug.drug_name}</span>
                    <span className="text-gray-500 dark:text-gray-400 ml-2">({drug.drug_code})</span>
                    <span className="text-blue-600 dark:text-blue-400 ml-2 text-xs">{drug.unit_price.toLocaleString()}원</span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {showDrugDropdown && !drugSearching && drugQuery.trim().length >= 1 && drugResults.length === 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
              검색 결과가 없습니다.
            </div>
          )}
        </div>
      </div>

      {/* 처방 항목 목록 */}
      {items.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-3 shadow-sm">
          <h2 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <span>📊</span> 처방 항목 ({items.length})
          </h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 dark:text-gray-400 text-xs border-b border-gray-100 dark:border-gray-700">
                <th className="text-left pb-2">약품명</th>
                <th className="text-center pb-2 w-20">수량</th>
                <th className="text-center pb-2 w-20">일수</th>
                <th className="text-right pb-2 w-28">금액</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
              {items.map((item, idx) => (
                <tr key={item.drug_code}>
                  <td className="py-2">
                    <div className="font-medium text-gray-900 dark:text-gray-100">💊 {item.drug_name}</div>
                    <div className="text-gray-400 dark:text-gray-500 text-xs">{item.drug_code}</div>
                  </td>
                  <td className="py-2 text-center">
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))}
                      className="w-16 text-center border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded px-1 py-0.5 text-sm"
                    />
                  </td>
                  <td className="py-2 text-center">
                    <input
                      type="number"
                      min={1}
                      value={item.days}
                      onChange={(e) => updateItem(idx, 'days', Number(e.target.value))}
                      className="w-16 text-center border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded px-1 py-0.5 text-sm"
                    />
                  </td>
                  <td className="py-2 text-right text-gray-700 dark:text-gray-300">
                    {(item.unit_price * item.quantity * item.days).toLocaleString()}원
                  </td>
                  <td className="py-2 text-center">
                    <button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600 dark:hover:text-red-300 text-xs transition-colors">✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {error && <p role="alert" className="text-red-600 dark:text-red-400 text-sm flex items-center gap-1"><span>⚠️</span>{error}</p>}

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving || items.length === 0}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-md"
        >
          {saving && <Spinner className="text-white" />}
          {saving ? '저장 중...' : '💾 처방 저장 → 조제'}
        </button>
      </div>
    </div>
  )
}
