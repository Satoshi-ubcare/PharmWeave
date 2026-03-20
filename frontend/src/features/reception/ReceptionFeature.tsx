import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { useWorkflowStore } from '@/stores/workflowStore'
import { usePatientSearch, usePatientCreate } from '@/hooks/usePatient'
import { useVisitCreate, useWorkflowStage } from '@/hooks/useVisit'
import { useToast } from '@/hooks/useToast'
import StagePatientList from '@/components/StagePatientList'
import PatientInfoModal from '@/components/PatientInfoModal'
import SortableLayout from '@/components/SortableLayout'
import SortableGrid from '@/components/SortableGrid'
import Spinner from '@/components/ui/Spinner'
import type { Patient, WorkflowStage, InsuranceType, CopayExemption } from '@/types'
import { INSURANCE_TYPE_LABELS, COPAY_EXEMPTION_LABELS } from '@/types'

function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>
  const lower = text.toLowerCase()
  const idx = lower.indexOf(query.toLowerCase())
  if (idx === -1) return <>{text}</>
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-yellow-200 dark:bg-yellow-800/40 text-yellow-900 dark:text-yellow-200 not-italic rounded px-0.5">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  )
}

const STAGE_ROUTES: { stage: WorkflowStage; path: string }[] = [
  { stage: 'reception',    path: '/reception' },
  { stage: 'prescription', path: '/prescription' },
  { stage: 'dispensing',   path: '/dispensing' },
  { stage: 'review',       path: '/review' },
  { stage: 'payment',      path: '/payment' },
  { stage: 'claim',        path: '/claim' },
]

export default function ReceptionFeature() {
  const navigate = useNavigate()
  const { visitId, currentStage, patient: storePatient, setVisit, setStage } = useWorkflowStore()
  const { toast } = useToast()

  // 대시보드에서 접수 단계 환자를 클릭해 넘어온 경우 (visitId 존재 + reception 단계)
  const isDashboardVisit = Boolean(visitId && currentStage === 'reception')

  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Patient | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [newPatient, setNewPatient] = useState({
    name: '', birth_date: '', phone: '',
    gender: '' as '' | 'M' | 'F',
    insurance_type: 'health_insurance' as InsuranceType,
    copay_exemption: 'none' as CopayExemption,
    allergies: '',
  })
  const [formErrors, setFormErrors] = useState({ name: '', birth_date: '', phone: '' })
  const dropdownRef = useRef<HTMLDivElement>(null)

  const [showEditModal, setShowEditModal] = useState(false)
  const [movingToPrescription, setMovingToPrescription] = useState(false)

  const { results, loading: searching, search, clear: clearResults } = usePatientSearch()
  const { loading: creating, error: createError, create: createPatient } = usePatientCreate()
  const { loading: starting, error: visitError, create: createVisit } = useVisitCreate()
  const { error: stageError, transition } = useWorkflowStage()

  useEffect(() => { if (createError) toast('error', createError) }, [createError, toast])
  useEffect(() => { if (visitError) toast('error', visitError) }, [visitError, toast])
  useEffect(() => { if (stageError) toast('error', stageError) }, [stageError, toast])

  useEffect(() => {
    if (query.trim().length < 1) {
      clearResults()
      setShowDropdown(false)
      return
    }
    const timer = setTimeout(() => {
      search(query)
      setShowDropdown(true)
    }, 300)
    return () => clearTimeout(timer)
  }, [query, search, clearResults])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = () => {
    if (query.trim().length >= 1) {
      search(query)
      setShowDropdown(true)
    }
  }

  const handleSelectPatient = (p: Patient) => {
    setSelected(p)
    setShowDropdown(false)
    setQuery(p.name)
    clearResults()
  }

  const validateNewPatient = (): boolean => {
    const errors = { name: '', birth_date: '', phone: '' }
    if (!newPatient.name.trim() || newPatient.name.trim().length < 2) {
      errors.name = '이름은 2자 이상 입력해야 합니다.'
    }
    if (!newPatient.birth_date) {
      errors.birth_date = '생년월일을 입력해야 합니다.'
    } else if (new Date(newPatient.birth_date) > new Date()) {
      errors.birth_date = '생년월일은 오늘 이전이어야 합니다.'
    }
    if (newPatient.phone && !/^\d{10,11}$/.test(newPatient.phone.replace(/-/g, ''))) {
      errors.phone = '전화번호는 숫자 10~11자리로 입력하세요.'
    }
    setFormErrors(errors)
    return !Object.values(errors).some(Boolean)
  }

  const handleCreatePatient = async () => {
    if (!validateNewPatient()) return
    const patient = await createPatient({
      name: newPatient.name,
      birth_date: newPatient.birth_date,
      phone: newPatient.phone || undefined,
      gender: newPatient.gender || undefined,
      insurance_type: newPatient.insurance_type,
      copay_exemption: newPatient.copay_exemption,
      allergies: newPatient.allergies || undefined,
    })
    if (patient) {
      setSelected(patient)
      setShowNewForm(false)
      setFormErrors({ name: '', birth_date: '', phone: '' })
      clearResults()
      toast('success', `${patient.name}님이 등록되었습니다.`)
    }
  }

  const handleStartVisit = async () => {
    if (!selected) return
    const visit = await createVisit(selected.id)
    if (!visit) return
    await transition(visit.id, 'prescription')
    setVisit({ ...visit, workflow_stage: 'prescription' }, selected)
    navigate('/prescription')
  }

  const handleMoveToPrescription = async () => {
    if (!visitId) return
    setMovingToPrescription(true)
    await transition(visitId, 'prescription')
    setStage('prescription')
    setMovingToPrescription(false)
    navigate('/prescription')
  }

  const inputBase = 'w-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-[#0B0A0A] dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors'

  const searchSection = (
    <>
      {/* 대시보드에서 접수 단계 환자로 진입한 경우 */}
      {isDashboardVisit && storePatient && (
        <div className="border border-blue-500/30 dark:border-blue-500/20 bg-blue-500/5 dark:bg-blue-500/5 rounded-xl p-5 flex items-center justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-blue-600 dark:text-blue-400">
              접수 대기 중인 환자
            </p>
            <p className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{storePatient.name}</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-500">
              {String(storePatient.birth_date).slice(0, 10)}
            </p>
          </div>
          <button
            onClick={() => void handleMoveToPrescription()}
            disabled={movingToPrescription}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#246AFE] hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-40"
          >
            {movingToPrescription && <Spinner size="sm" className="text-white" />}
            {movingToPrescription ? '처리 중' : '처방 단계로 이동'}
          </button>
        </div>
      )}

      {/* 환자 검색 */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 space-y-4">
        <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-blue-600 dark:text-blue-400">
          환자 검색
        </p>
        <div className="flex gap-2">
          <div className="relative flex-1" ref={dropdownRef}>
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                if (selected && e.target.value !== selected.name) setSelected(null)
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              onFocus={() => results.length > 0 && setShowDropdown(true)}
              placeholder="이름 또는 생년월일 — 입력 시 자동 검색"
              className={inputBase}
            />
            {searching && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 text-xs">검색 중</span>
            )}

            {showDropdown && results.length > 0 && (
              <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden">
                {results.map((p) => (
                  <li key={p.id}>
                    <button
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSelectPatient(p)}
                      className="w-full text-left px-4 py-3 hover:bg-blue-50/50 dark:hover:bg-zinc-800 transition-colors text-sm border-b border-zinc-100 dark:border-zinc-800 last:border-0"
                    >
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">
                        <HighlightText text={p.name} query={query} />
                      </span>
                      <span className="text-zinc-400 dark:text-zinc-600 ml-3 text-xs">
                        <HighlightText text={String(p.birth_date).slice(0, 10)} query={query} />
                      </span>
                      {p.phone && <span className="text-zinc-400 dark:text-zinc-600 ml-3 text-xs">{p.phone}</span>}
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {showDropdown && !searching && query.trim().length >= 1 && results.length === 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl px-4 py-3 text-sm text-zinc-400">
                검색 결과가 없습니다.
              </div>
            )}
          </div>
          <button
            onClick={handleSearch}
            disabled={searching || query.trim().length < 1}
            className="px-4 py-2.5 bg-blue-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-blue-100 dark:hover:bg-zinc-700 rounded-xl text-sm font-medium disabled:opacity-40 transition-colors"
          >
            검색
          </button>
          <button
            onClick={() => setShowNewForm(true)}
            className="px-4 py-2.5 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-blue-500 hover:text-blue-700 dark:hover:text-blue-400 rounded-xl text-sm font-medium transition-colors"
          >
            신규 등록
          </button>
        </div>
      </div>

      {/* 신규 환자 등록 폼 */}
      {showNewForm && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 space-y-5">
          <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-blue-600 dark:text-blue-400">
            신규 환자 등록
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs text-zinc-500 dark:text-zinc-500">이름 *</label>
              <input
                type="text"
                value={newPatient.name}
                onChange={(e) => {
                  setNewPatient({ ...newPatient, name: e.target.value })
                  if (formErrors.name) setFormErrors({ ...formErrors, name: '' })
                }}
                aria-invalid={!!formErrors.name}
                className={cn(inputBase, formErrors.name && 'border-red-400 dark:border-red-600')}
              />
              {formErrors.name && (
                <p role="alert" className="text-xs text-red-400">{formErrors.name}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs text-zinc-500 dark:text-zinc-500">생년월일 *</label>
              <input
                type="date"
                value={newPatient.birth_date}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => {
                  setNewPatient({ ...newPatient, birth_date: e.target.value })
                  if (formErrors.birth_date) setFormErrors({ ...formErrors, birth_date: '' })
                }}
                aria-invalid={!!formErrors.birth_date}
                className={cn(inputBase, formErrors.birth_date && 'border-red-400 dark:border-red-600')}
              />
              {formErrors.birth_date && (
                <p role="alert" className="text-xs text-red-400">{formErrors.birth_date}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs text-zinc-500 dark:text-zinc-500">
                전화번호 <span className="text-zinc-400">(선택)</span>
              </label>
              <input
                type="tel"
                value={newPatient.phone}
                placeholder="01012345678"
                onChange={(e) => {
                  setNewPatient({ ...newPatient, phone: e.target.value })
                  if (formErrors.phone) setFormErrors({ ...formErrors, phone: '' })
                }}
                aria-invalid={!!formErrors.phone}
                className={cn(inputBase, formErrors.phone && 'border-red-400 dark:border-red-600')}
              />
              {formErrors.phone && (
                <p role="alert" className="text-xs text-red-400">{formErrors.phone}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs text-zinc-500 dark:text-zinc-500">
                성별 <span className="text-zinc-400">(선택)</span>
              </label>
              <select
                value={newPatient.gender}
                onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value as '' | 'M' | 'F' })}
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
                value={newPatient.insurance_type}
                onChange={(e) => setNewPatient({ ...newPatient, insurance_type: e.target.value as InsuranceType })}
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
                value={newPatient.copay_exemption}
                onChange={(e) => setNewPatient({ ...newPatient, copay_exemption: e.target.value as CopayExemption })}
                className={inputBase}
              >
                {(Object.entries(COPAY_EXEMPTION_LABELS) as [CopayExemption, string][]).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2 space-y-1.5">
              <label className="block text-xs text-zinc-500 dark:text-zinc-500">
                알레르기 / 주요 이력 <span className="text-zinc-400">(선택)</span>
              </label>
              <textarea
                value={newPatient.allergies}
                onChange={(e) => setNewPatient({ ...newPatient, allergies: e.target.value })}
                placeholder="예: 페니실린 알레르기, 고혈압 약 복용 중"
                rows={2}
                className={cn(inputBase, 'resize-none')}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCreatePatient}
              disabled={creating}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#246AFE] hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-40"
            >
              {creating && <Spinner size="sm" className="text-white" />}
              {creating ? '등록 중' : '등록'}
            </button>
            <button
              onClick={() => setShowNewForm(false)}
              className="px-4 py-2.5 border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 rounded-xl text-sm transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* 선택된 환자 + 방문 시작 */}
      {selected && (
        <div className="border border-blue-500/30 dark:border-blue-500/20 bg-blue-500/5 dark:bg-blue-500/5 rounded-xl p-5 flex items-center justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-blue-600 dark:text-blue-400">
              선택된 환자
            </p>
            <p className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{selected.name}</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-500">
              {String(selected.birth_date).slice(0, 10)}
              {selected.gender && ` · ${selected.gender === 'M' ? '남' : '여'}`}
              {selected.phone && ` · ${selected.phone}`}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-500">
              {INSURANCE_TYPE_LABELS[selected.insurance_type ?? 'health_insurance']}
              {selected.copay_exemption && selected.copay_exemption !== 'none' && (
                <span className="ml-1.5 text-blue-700 dark:text-blue-400">
                  · {COPAY_EXEMPTION_LABELS[selected.copay_exemption]}
                </span>
              )}
            </p>
            {selected.allergies && (
              <p className="text-xs text-red-500 dark:text-red-400 mt-0.5">알레르기: {selected.allergies}</p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setShowEditModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200 text-xs rounded-xl transition-colors"
              title="환자 정보 수정"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              정보 수정
            </button>
            <button
              onClick={handleStartVisit}
              disabled={starting}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#246AFE] hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-40"
            >
              {starting && <Spinner size="sm" className="text-white" />}
              {starting ? '처리 중' : '방문 시작'}
            </button>
          </div>
        </div>
      )}

      {/* 환자 정보 수정 모달 */}
      {selected && (
        <PatientInfoModal
          patient={selected}
          open={showEditModal}
          onClose={() => setShowEditModal(false)}
          onUpdated={(updated) => {
            setSelected(updated)
            setQuery(updated.name)
            setShowEditModal(false)
          }}
        />
      )}
    </>
  )

  const stageListSection = (
    <div className="space-y-3">
      <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-blue-600 dark:text-blue-400">
        오늘의 단계별 대기 현황
      </p>
      <SortableGrid
        pageId="reception-stages"
        defaultOrder={STAGE_ROUTES.map((r) => r.stage)}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
        items={Object.fromEntries(
          STAGE_ROUTES.map(({ stage, path }) => [
            stage,
            <StagePatientList stage={stage} onSelect={() => navigate(path)} />,
          ])
        )}
      />
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="space-y-1">
        <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-blue-600 dark:text-blue-400">
          Step 01
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">접수</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-500">환자를 검색하거나 신규 등록 후 방문을 시작합니다.</p>
      </div>

      <SortableLayout
        pageId="reception"
        defaultOrder={['search', 'stage-list']}
        sections={{ search: searchSection, 'stage-list': stageListSection }}
      />
    </div>
  )
}
