import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { useWorkflowStore } from '@/stores/workflowStore'
import { usePatientSearch, usePatientCreate } from '@/hooks/usePatient'
import { useVisitCreate, useWorkflowStage } from '@/hooks/useVisit'
import { useToast } from '@/hooks/useToast'
import StagePatientList from '@/components/StagePatientList'
import Spinner from '@/components/ui/Spinner'
import type { Patient, WorkflowStage } from '@/types'

const STAGE_ROUTES: { stage: WorkflowStage; path: string }[] = [
  { stage: 'prescription', path: '/prescription' },
  { stage: 'dispensing',   path: '/dispensing' },
  { stage: 'review',       path: '/review' },
  { stage: 'payment',      path: '/payment' },
  { stage: 'claim',        path: '/claim' },
]

export default function ReceptionFeature() {
  const navigate = useNavigate()
  const { setVisit } = useWorkflowStore()
  const { toast } = useToast()

  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Patient | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [newPatient, setNewPatient] = useState({ name: '', birth_date: '', phone: '' })
  const [formErrors, setFormErrors] = useState({ name: '', birth_date: '', phone: '' })
  const dropdownRef = useRef<HTMLDivElement>(null)

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
    const patient = await createPatient(newPatient)
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

  const inputBase = 'w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-amber-400 dark:focus:border-amber-400 transition-colors'

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="space-y-1">
        <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-amber-500 dark:text-amber-400">
          Step 01
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">접수</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-500">환자를 검색하거나 신규 등록 후 방문을 시작합니다.</p>
      </div>

      {/* 환자 검색 */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-6 space-y-4">
        <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-amber-500 dark:text-amber-400">
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
              <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded shadow-2xl overflow-hidden">
                {results.map((p) => (
                  <li key={p.id}>
                    <button
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSelectPatient(p)}
                      className="w-full text-left px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-sm border-b border-zinc-100 dark:border-zinc-800 last:border-0"
                    >
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">{p.name}</span>
                      <span className="text-zinc-400 dark:text-zinc-600 ml-3 text-xs">{String(p.birth_date).slice(0, 10)}</span>
                      {p.phone && <span className="text-zinc-400 dark:text-zinc-600 ml-3 text-xs">{p.phone}</span>}
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {showDropdown && !searching && query.trim().length >= 1 && results.length === 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded shadow-2xl px-4 py-3 text-sm text-zinc-400">
                검색 결과가 없습니다.
              </div>
            )}
          </div>
          <button
            onClick={handleSearch}
            disabled={searching || query.trim().length < 1}
            className="px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded text-sm font-medium disabled:opacity-40 transition-colors"
          >
            검색
          </button>
          <button
            onClick={() => setShowNewForm(true)}
            className="px-4 py-2.5 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-amber-400 dark:hover:border-amber-400 hover:text-amber-600 dark:hover:text-amber-400 rounded text-sm font-medium transition-colors"
          >
            신규 등록
          </button>
        </div>
      </div>

      {/* 신규 환자 등록 폼 */}
      {showNewForm && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-6 space-y-5">
          <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-amber-500 dark:text-amber-400">
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
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCreatePatient}
              disabled={creating}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-zinc-950 text-sm font-semibold rounded transition-colors disabled:opacity-40"
            >
              {creating && <Spinner size="sm" className="text-zinc-950" />}
              {creating ? '등록 중' : '등록'}
            </button>
            <button
              onClick={() => setShowNewForm(false)}
              className="px-4 py-2.5 border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 rounded text-sm transition-colors"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* 선택된 환자 + 방문 시작 */}
      {selected && (
        <div className="border border-amber-400/30 dark:border-amber-400/20 bg-amber-400/5 dark:bg-amber-400/5 rounded p-5 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-amber-500 dark:text-amber-400">
              선택된 환자
            </p>
            <p className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{selected.name}</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-500">
              {String(selected.birth_date).slice(0, 10)}
              {selected.phone && ` · ${selected.phone}`}
            </p>
          </div>
          <button
            onClick={handleStartVisit}
            disabled={starting}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-zinc-950 text-sm font-semibold rounded transition-colors disabled:opacity-40"
          >
            {starting && <Spinner size="sm" className="text-zinc-950" />}
            {starting ? '처리 중' : '방문 시작'}
          </button>
        </div>
      )}

      {/* 단계별 대기 현황 */}
      <div className="space-y-3">
        <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-amber-500 dark:text-amber-400">
          오늘의 단계별 대기 현황
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {STAGE_ROUTES.map(({ stage, path }) => (
            <StagePatientList
              key={stage}
              stage={stage}
              onSelect={() => navigate(path)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
