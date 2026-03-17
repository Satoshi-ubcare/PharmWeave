import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWorkflowStore } from '@/stores/workflowStore'
import { usePrescriptionSave, useDrugSearch } from '@/hooks/usePrescription'
import { useWorkflowStage } from '@/hooks/useVisit'
import { useClinicSearch } from '@/hooks/useClinic'
import { useToast } from '@/hooks/useToast'
import StagePatientList from '@/components/StagePatientList'
import Spinner from '@/components/ui/Spinner'
import { cn } from '@/lib/cn'
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
  const [showClinicDropdown, setShowClinicDropdown] = useState(false)
  const [formErrors, setFormErrors] = useState({ clinicName: '', items: '' })
  const drugDropdownRef = useRef<HTMLDivElement>(null)
  const clinicDropdownRef = useRef<HTMLDivElement>(null)

  const { results: drugResults, loading: drugSearching, error: drugError, search: searchDrug, clear: clearDrug } = useDrugSearch()
  const { results: clinicResults, loading: clinicSearching, search: searchClinic, clear: clearClinic } = useClinicSearch()
  const { loading: saving, error: saveError, save } = usePrescriptionSave()
  const { error: stageError, transition } = useWorkflowStage()

  useEffect(() => { if (saveError) toast('error', saveError) }, [saveError, toast])
  useEffect(() => { if (stageError) toast('error', stageError) }, [stageError, toast])
  useEffect(() => { if (drugError) toast('error', drugError) }, [drugError, toast])

  useEffect(() => {
    setClinicName('')
    setDoctorName('')
    setPrescribedAt(new Date().toISOString().split('T')[0])
    setItems([])
    setDrugQuery('')
    setShowDrugDropdown(false)
    setShowClinicDropdown(false)
    setFormErrors({ clinicName: '', items: '' })
    clearDrug()
    clearClinic()
  }, [visitId, clearDrug, clearClinic])

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
      if (clinicDropdownRef.current && !clinicDropdownRef.current.contains(e.target as Node)) {
        setShowClinicDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 의료기관명 자동완성
  useEffect(() => {
    if (clinicName.trim().length < 1) {
      clearClinic()
      setShowClinicDropdown(false)
      return
    }
    const timer = setTimeout(() => {
      searchClinic(clinicName)
      setShowClinicDropdown(true)
    }, 250)
    return () => clearTimeout(timer)
  }, [clinicName, searchClinic, clearClinic])

  const addItem = (drug: Drug) => {
    if (items.find((i) => i.drug_code === drug.drug_code)) return
    setItems([...items, { drug_code: drug.drug_code, drug_name: drug.drug_name, unit_price: drug.unit_price, quantity: 1, days: 1 }])
    if (formErrors.items) setFormErrors((prev) => ({ ...prev, items: '' }))
    clearDrug()
    setDrugQuery('')
    setShowDrugDropdown(false)
  }

  const updateItem = (idx: number, field: keyof ItemInput, value: number) => {
    setItems(items.map((item, i) => i === idx ? { ...item, [field]: value } : item))
  }

  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx))

  const handleSave = async () => {
    if (!visitId) return
    const errors = { clinicName: '', items: '' }
    if (!clinicName.trim()) errors.clinicName = '의료기관명을 입력해야 합니다.'
    if (items.length === 0) errors.items = '처방 항목을 1개 이상 추가해야 합니다.'
    if (errors.clinicName || errors.items) {
      setFormErrors(errors)
      return
    }
    setFormErrors({ clinicName: '', items: '' })
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

  const inputBase = 'w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400 dark:focus:border-amber-400 transition-colors'
  const totalCost = items.reduce((sum, item) => sum + item.unit_price * item.quantity * item.days, 0)

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-amber-500 dark:text-amber-400">
          Step 02
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">처방</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-500">처방전 정보와 약품 항목을 입력합니다.</p>
      </div>

      <StagePatientList stage="prescription" />

      {!visitId && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-8 text-center text-zinc-400 dark:text-zinc-600 text-sm">
          먼저 접수 단계에서 방문을 시작해주세요.
        </div>
      )}

      {visitId && (
        <>
          {/* 처방전 정보 */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-6 space-y-4">
            <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-amber-500 dark:text-amber-400">
              처방전 정보
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5" ref={clinicDropdownRef}>
                <label className="block text-xs text-zinc-500 dark:text-zinc-500">의료기관명 *</label>
                <div className="relative">
                  <input
                    type="text"
                    value={clinicName}
                    onChange={(e) => {
                      setClinicName(e.target.value)
                      if (formErrors.clinicName) setFormErrors((prev) => ({ ...prev, clinicName: '' }))
                    }}
                    onFocus={() => clinicResults.length > 0 && setShowClinicDropdown(true)}
                    placeholder="기관명 입력 — 저장된 기관 자동완성"
                    aria-invalid={!!formErrors.clinicName}
                    className={cn(inputBase, formErrors.clinicName && 'border-red-400 dark:border-red-600')}
                  />
                  {clinicSearching && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">검색 중</span>
                  )}

                  {showClinicDropdown && clinicResults.length > 0 && (
                    <ul className="absolute z-20 w-full mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded shadow-2xl overflow-hidden max-h-48 overflow-y-auto">
                      {clinicResults.map((clinic) => (
                        <li key={clinic.id}>
                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              setClinicName(clinic.name)
                              setShowClinicDropdown(false)
                              clearClinic()
                              if (formErrors.clinicName) setFormErrors((prev) => ({ ...prev, clinicName: '' }))
                            }}
                            className="w-full text-left px-4 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-sm border-b border-zinc-100 dark:border-zinc-800 last:border-0"
                          >
                            <span className="font-medium text-zinc-900 dark:text-zinc-100">{clinic.name}</span>
                            {clinic.phone && (
                              <span className="text-zinc-400 dark:text-zinc-600 ml-2 text-xs">{clinic.phone}</span>
                            )}
                            {clinic.address && (
                              <span className="block text-zinc-400 dark:text-zinc-600 text-xs mt-0.5 truncate">{clinic.address}</span>
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {formErrors.clinicName && (
                  <p role="alert" className="text-xs text-red-400">{formErrors.clinicName}</p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs text-zinc-500 dark:text-zinc-500">처방 의사명</label>
                <input
                  type="text"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  className={inputBase}
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs text-zinc-500 dark:text-zinc-500">처방일 *</label>
                <input
                  type="date"
                  value={prescribedAt}
                  onChange={(e) => setPrescribedAt(e.target.value)}
                  className={inputBase}
                />
              </div>
            </div>
          </div>

          {/* 약품 검색 */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-6 space-y-4">
            <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-amber-500 dark:text-amber-400">
              약품 추가
            </p>
            <div className="relative" ref={drugDropdownRef}>
              <input
                type="text"
                value={drugQuery}
                onChange={(e) => setDrugQuery(e.target.value)}
                onFocus={() => drugResults.length > 0 && setShowDrugDropdown(true)}
                placeholder="약품명 또는 코드 입력 시 자동 검색"
                className={inputBase}
              />
              {drugSearching && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">검색 중</span>
              )}

              {showDrugDropdown && drugResults.length > 0 && (
                <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded shadow-2xl overflow-hidden max-h-60 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800">
                  {drugResults.map((drug) => (
                    <li key={drug.id}>
                      <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => addItem(drug)}
                        className="w-full text-left px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-sm transition-colors"
                      >
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">{drug.drug_name}</span>
                        <span className="text-zinc-400 dark:text-zinc-600 ml-2 text-xs">({drug.drug_code})</span>
                        <span className="text-amber-500 dark:text-amber-400 ml-2 text-xs font-medium">
                          {drug.unit_price.toLocaleString()}원
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {showDrugDropdown && !drugSearching && drugQuery.trim().length >= 1 && drugResults.length === 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded shadow-2xl px-4 py-3 text-sm text-zinc-400">
                  검색 결과가 없습니다.
                </div>
              )}
            </div>
          </div>

          {/* 처방 항목 목록 */}
          {items.length > 0 && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-amber-500 dark:text-amber-400">
                  처방 항목 ({items.length})
                </p>
                <span className="text-xs font-semibold text-amber-500 dark:text-amber-400">
                  합계 {totalCost.toLocaleString()}원
                </span>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[10px] tracking-[0.1em] uppercase text-zinc-400 dark:text-zinc-600 border-b border-zinc-100 dark:border-zinc-800">
                    <th className="text-left pb-3">약품명</th>
                    <th className="text-center pb-3 w-20">수량</th>
                    <th className="text-center pb-3 w-20">일수</th>
                    <th className="text-right pb-3 w-28">금액</th>
                    <th className="w-8" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                  {items.map((item, idx) => (
                    <tr key={item.drug_code}>
                      <td className="py-3">
                        <div className="font-medium text-zinc-900 dark:text-zinc-100">{item.drug_name}</div>
                        <div className="text-zinc-400 dark:text-zinc-600 text-xs mt-0.5">{item.drug_code}</div>
                      </td>
                      <td className="py-3 text-center">
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))}
                          className="w-16 text-center bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 rounded px-1 py-1 text-sm focus:outline-none focus:border-amber-400 transition-colors"
                        />
                      </td>
                      <td className="py-3 text-center">
                        <input
                          type="number"
                          min={1}
                          value={item.days}
                          onChange={(e) => updateItem(idx, 'days', Number(e.target.value))}
                          className="w-16 text-center bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 rounded px-1 py-1 text-sm focus:outline-none focus:border-amber-400 transition-colors"
                        />
                      </td>
                      <td className="py-3 text-right font-medium text-zinc-700 dark:text-zinc-300">
                        {(item.unit_price * item.quantity * item.days).toLocaleString()}원
                      </td>
                      <td className="py-3 text-center">
                        <button
                          onClick={() => removeItem(idx)}
                          className="text-zinc-300 dark:text-zinc-700 hover:text-red-400 dark:hover:text-red-400 transition-colors"
                        >
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="1" y1="1" x2="11" y2="11" /><line x1="11" y1="1" x2="1" y2="11" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {formErrors.items && (
            <p role="alert" className="text-red-400 text-sm">{formErrors.items}</p>
          )}

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving || items.length === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-zinc-950 text-sm font-semibold rounded transition-colors disabled:opacity-40"
            >
              {saving && <Spinner size="sm" className="text-zinc-950" />}
              {saving ? '저장 중' : '처방 저장 — 조제로'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
