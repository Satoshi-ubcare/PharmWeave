import { useState, useEffect } from 'react'
import { cn } from '@/lib/cn'
import { usePatientUpdate } from '@/hooks/usePatient'
import { useToast } from '@/hooks/useToast'
import Spinner from '@/components/ui/Spinner'
import type { Patient, InsuranceType, CopayExemption } from '@/types'
import { INSURANCE_TYPE_LABELS, COPAY_EXEMPTION_LABELS } from '@/types'

interface PatientInfoModalProps {
  patient: Patient
  open: boolean
  onClose: () => void
  onUpdated: (patient: Patient) => void
}

const inputBase = 'w-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-[#0B0A0A] dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors'

export default function PatientInfoModal({ patient, open, onClose, onUpdated }: PatientInfoModalProps) {
  const { toast } = useToast()
  const { loading: updating, error: updateError, update: updatePatient } = usePatientUpdate()

  const [editMode, setEditMode] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    birth_date: '',
    phone: '',
    gender: '' as '' | 'M' | 'F',
    insurance_type: 'health_insurance' as InsuranceType,
    copay_exemption: 'none' as CopayExemption,
    allergies: '',
  })
  const [editErrors, setEditErrors] = useState({ name: '', birth_date: '', phone: '' })

  useEffect(() => {
    if (updateError) toast('error', updateError)
  }, [updateError, toast])

  useEffect(() => {
    if (open) setEditMode(false)
  }, [open])

  const openEditForm = () => {
    setEditForm({
      name: patient.name,
      birth_date: String(patient.birth_date).slice(0, 10),
      phone: patient.phone ?? '',
      gender: (patient.gender as '' | 'M' | 'F') ?? '',
      insurance_type: patient.insurance_type ?? 'health_insurance',
      copay_exemption: patient.copay_exemption ?? 'none',
      allergies: patient.allergies ?? '',
    })
    setEditErrors({ name: '', birth_date: '', phone: '' })
    setEditMode(true)
  }

  const validateForm = (): boolean => {
    const errors = { name: '', birth_date: '', phone: '' }
    if (!editForm.name.trim() || editForm.name.trim().length < 2) {
      errors.name = '이름은 2자 이상 입력해야 합니다.'
    }
    if (!editForm.birth_date) {
      errors.birth_date = '생년월일을 입력해야 합니다.'
    } else if (new Date(editForm.birth_date) > new Date()) {
      errors.birth_date = '생년월일은 오늘 이전이어야 합니다.'
    }
    if (editForm.phone && !/^\d{10,11}$/.test(editForm.phone.replace(/-/g, ''))) {
      errors.phone = '전화번호는 숫자 10~11자리로 입력하세요.'
    }
    setEditErrors(errors)
    return !Object.values(errors).some(Boolean)
  }

  const handleSave = async () => {
    if (!validateForm()) return
    const updated = await updatePatient(patient.id, {
      name: editForm.name.trim(),
      birth_date: editForm.birth_date,
      phone: editForm.phone.trim() || null,
      gender: editForm.gender || null,
      insurance_type: editForm.insurance_type,
      copay_exemption: editForm.copay_exemption,
      allergies: editForm.allergies.trim() || null,
    })
    if (updated) {
      onUpdated(updated)
      setEditMode(false)
      toast('success', `${updated.name}님의 정보가 수정되었습니다.`)
    }
  }

  if (!open) return null

  const genderLabel = patient.gender === 'M' ? '남성' : patient.gender === 'F' ? '여성' : '—'
  const insuranceLabel = INSURANCE_TYPE_LABELS[patient.insurance_type] ?? patient.insurance_type
  const copayLabel = COPAY_EXEMPTION_LABELS[patient.copay_exemption] ?? patient.copay_exemption

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="patient-info-modal-title"
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl w-full max-w-md mx-4 p-6 space-y-5">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-blue-600 dark:text-blue-400">
              {editMode ? '환자 정보 수정' : '환자 정보'}
            </p>
            <h2 id="patient-info-modal-title" className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              {patient.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
            aria-label="닫기"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {editMode ? (
          /* 수정 폼 */
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs text-zinc-500 dark:text-zinc-500">이름 *</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => {
                  setEditForm({ ...editForm, name: e.target.value })
                  if (editErrors.name) setEditErrors({ ...editErrors, name: '' })
                }}
                aria-invalid={!!editErrors.name}
                className={cn(inputBase, editErrors.name && 'border-red-400 dark:border-red-600')}
              />
              {editErrors.name && <p role="alert" className="text-xs text-red-400">{editErrors.name}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs text-zinc-500 dark:text-zinc-500">생년월일 *</label>
              <input
                type="date"
                value={editForm.birth_date}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => {
                  setEditForm({ ...editForm, birth_date: e.target.value })
                  if (editErrors.birth_date) setEditErrors({ ...editErrors, birth_date: '' })
                }}
                aria-invalid={!!editErrors.birth_date}
                className={cn(inputBase, editErrors.birth_date && 'border-red-400 dark:border-red-600')}
              />
              {editErrors.birth_date && <p role="alert" className="text-xs text-red-400">{editErrors.birth_date}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs text-zinc-500 dark:text-zinc-500">
                전화번호 <span className="text-zinc-400">(선택 — 비워두면 삭제)</span>
              </label>
              <input
                type="tel"
                value={editForm.phone}
                placeholder="01012345678"
                onChange={(e) => {
                  setEditForm({ ...editForm, phone: e.target.value })
                  if (editErrors.phone) setEditErrors({ ...editErrors, phone: '' })
                }}
                aria-invalid={!!editErrors.phone}
                className={cn(inputBase, editErrors.phone && 'border-red-400 dark:border-red-600')}
              />
              {editErrors.phone && <p role="alert" className="text-xs text-red-400">{editErrors.phone}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs text-zinc-500 dark:text-zinc-500">성별</label>
              <select
                value={editForm.gender}
                onChange={(e) => setEditForm({ ...editForm, gender: e.target.value as '' | 'M' | 'F' })}
                className={inputBase}
              >
                <option value="">선택 안 함</option>
                <option value="M">남성</option>
                <option value="F">여성</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs text-zinc-500 dark:text-zinc-500">보험 유형</label>
              <select
                value={editForm.insurance_type}
                onChange={(e) => setEditForm({ ...editForm, insurance_type: e.target.value as InsuranceType })}
                className={inputBase}
              >
                {(Object.entries(INSURANCE_TYPE_LABELS) as [InsuranceType, string][]).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs text-zinc-500 dark:text-zinc-500">경감 대상</label>
              <select
                value={editForm.copay_exemption}
                onChange={(e) => setEditForm({ ...editForm, copay_exemption: e.target.value as CopayExemption })}
                className={inputBase}
              >
                {(Object.entries(COPAY_EXEMPTION_LABELS) as [CopayExemption, string][]).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs text-zinc-500 dark:text-zinc-500">
                알레르기 / 주요 이력 <span className="text-zinc-400">(선택)</span>
              </label>
              <textarea
                value={editForm.allergies}
                onChange={(e) => setEditForm({ ...editForm, allergies: e.target.value })}
                placeholder="예: 페니실린 알레르기"
                rows={2}
                className={cn(inputBase, 'resize-none')}
              />
            </div>

            <div className="flex gap-2 justify-end pt-1">
              <button
                onClick={() => setEditMode(false)}
                className="px-4 py-2 border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 text-sm rounded-xl transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                disabled={updating}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#246AFE] hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-40"
              >
                {updating && <Spinner size="sm" className="text-white" />}
                {updating ? '저장 중' : '저장'}
              </button>
            </div>
          </div>
        ) : (
          /* 조회 모드 */
          <>
            <dl className="space-y-3">
              {[
                { label: '생년월일', value: String(patient.birth_date).slice(0, 10) },
                { label: '성별', value: genderLabel },
                { label: '전화번호', value: patient.phone ?? '—' },
                { label: '보험 유형', value: insuranceLabel },
                { label: '경감 대상', value: copayLabel },
                { label: '알레르기 / 주요 이력', value: patient.allergies ?? '—' },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <dt className="w-28 flex-shrink-0 text-xs text-zinc-400 dark:text-zinc-500 pt-0.5">{label}</dt>
                  <dd className="text-sm text-zinc-800 dark:text-zinc-200 break-words">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="flex gap-2 justify-end pt-1">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 text-sm rounded-xl transition-colors"
              >
                닫기
              </button>
              <button
                onClick={openEditForm}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#246AFE] hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                정보 수정
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
