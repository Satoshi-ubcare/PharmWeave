import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWorkflowStore } from '@/stores/workflowStore'
import { usePatientSearch, usePatientCreate } from '@/hooks/usePatient'
import { useVisitCreate, useWorkflowStage } from '@/hooks/useVisit'
import StagePatientList from '@/components/StagePatientList'
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

  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Patient | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [newPatient, setNewPatient] = useState({ name: '', birth_date: '', phone: '' })
  const dropdownRef = useRef<HTMLDivElement>(null)

  const { results, loading: searching, search, clear: clearResults } = usePatientSearch()
  const { create: createPatient } = usePatientCreate()
  const { loading: starting, create: createVisit } = useVisitCreate()
  const { transition } = useWorkflowStage()

  // debounce 자동 검색: 1자 이상 입력 후 300ms 대기
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

  // 드롭다운 바깥 클릭 시 닫기
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

  const handleCreatePatient = async () => {
    const patient = await createPatient(newPatient)
    if (patient) {
      setSelected(patient)
      setShowNewForm(false)
      clearResults()
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

  const error = ''

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">접수</h1>
        <p className="text-gray-500 text-sm mt-1">환자를 검색하거나 신규 등록 후 방문을 시작합니다.</p>
      </div>

      {/* 환자 검색 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">환자 검색</h2>
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
              className="w-full border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searching && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">검색 중…</span>
            )}

            {/* 자동완성 드롭다운 */}
            {showDropdown && results.length > 0 && (
              <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                {results.map((p) => (
                  <li key={p.id}>
                    <button
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSelectPatient(p)}
                      className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors text-sm border-b border-gray-100 last:border-0"
                    >
                      <span className="font-medium text-gray-900">{p.name}</span>
                      <span className="text-gray-500 ml-3">{String(p.birth_date).slice(0, 10)}</span>
                      {p.phone && <span className="text-gray-400 ml-3">{p.phone}</span>}
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {showDropdown && !searching && query.trim().length >= 1 && results.length === 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-3 text-sm text-gray-500">
                검색 결과가 없습니다.
              </div>
            )}
          </div>
          <button
            onClick={handleSearch}
            disabled={searching || query.trim().length < 1}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            검색
          </button>
          <button
            onClick={() => setShowNewForm(true)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            신규 등록
          </button>
        </div>
      </div>

      {/* 신규 환자 등록 폼 */}
      {showNewForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-800">신규 환자 등록</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">이름 *</label>
              <input
                type="text"
                value={newPatient.name}
                onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">생년월일 * (YYYY-MM-DD)</label>
              <input
                type="date"
                value={newPatient.birth_date}
                onChange={(e) => setNewPatient({ ...newPatient, birth_date: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">전화번호</label>
              <input
                type="tel"
                value={newPatient.phone}
                onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCreatePatient}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              등록
            </button>
            <button
              onClick={() => setShowNewForm(false)}
              className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm hover:bg-gray-50"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* 선택된 환자 + 방문 시작 */}
      {selected && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-600 font-medium">선택된 환자</p>
            <p className="text-lg font-bold text-blue-900">{selected.name}</p>
            <p className="text-sm text-blue-700">{String(selected.birth_date).slice(0, 10)} {selected.phone && `· ${selected.phone}`}</p>
          </div>
          <button
            onClick={handleStartVisit}
            disabled={starting}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {starting ? '처리 중...' : '방문 시작 →'}
          </button>
        </div>
      )}

      {error && (
        <p role="alert" className="text-red-600 text-sm">{error}</p>
      )}

      {/* 단계별 대기 현황 */}
      <div>
        <h2 className="text-base font-semibold text-gray-800 mb-3">오늘의 단계별 대기 현황</h2>
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
