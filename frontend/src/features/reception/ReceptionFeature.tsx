import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWorkflowStore } from '@/stores/workflowStore'
import { usePatientSearch, usePatientCreate } from '@/hooks/usePatient'
import { useVisitCreate, useWorkflowStage } from '@/hooks/useVisit'
import type { Patient } from '@/types'

export default function ReceptionFeature() {
  const navigate = useNavigate()
  const { setVisit } = useWorkflowStore()

  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Patient | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const [newPatient, setNewPatient] = useState({ name: '', birth_date: '', phone: '' })

  const { results, loading: searching, search, clear: clearResults } = usePatientSearch()
  const { loading: creating, create: createPatient } = usePatientCreate()
  const { loading: starting, create: createVisit } = useVisitCreate()
  const { transition } = useWorkflowStage()

  const handleSearch = () => search(query)

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
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="이름 또는 생년월일 (YYYY-MM-DD)"
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSearch}
            disabled={searching || creating}
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

        {results.length > 0 && (
          <ul className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden">
            {results.map((p) => (
              <li key={p.id}>
                <button
                  onClick={() => setSelected(p)}
                  className={[
                    'w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors text-sm',
                    selected?.id === p.id && 'bg-blue-50 font-medium',
                  ].join(' ')}
                >
                  <span className="font-medium">{p.name}</span>
                  <span className="text-gray-500 ml-3">{p.birth_date}</span>
                  {p.phone && <span className="text-gray-400 ml-3">{p.phone}</span>}
                </button>
              </li>
            ))}
          </ul>
        )}
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
            <p className="text-sm text-blue-700">{selected.birth_date} {selected.phone && `· ${selected.phone}`}</p>
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
    </div>
  )
}
