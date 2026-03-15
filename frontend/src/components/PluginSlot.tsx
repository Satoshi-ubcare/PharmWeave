import { usePluginStore } from '@/stores/pluginStore'
import { usePluginExecute } from '@/hooks/usePlugin'

interface DurResult {
  warnings: { drug?: string; message: string }[]
  status: 'safe' | 'warning'
  checkedAt: string
}

interface MedGuideResult {
  guides: { drug_name: string; how_to_take: string; warnings: string[] }[]
  generatedAt: string
}

interface Props {
  pluginId: string
  visitId: string
}

export default function PluginSlot({ pluginId, visitId }: Props) {
  const { plugins } = usePluginStore()
  const plugin = plugins.find((p) => p.id === pluginId)
  const { loading, result, error, execute } = usePluginExecute()

  if (!plugin || !plugin.enabled) return null

  const handleExecute = async () => {
    await execute(pluginId, visitId)
  }

  return (
    <div className="bg-white rounded-xl border border-indigo-100 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-800 text-sm">{plugin.name}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{plugin.description}</p>
        </div>
        {!result ? (
          <button
            onClick={handleExecute}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {loading ? '실행 중...' : '실행'}
          </button>
        ) : (
          <span className="text-xs text-green-600 font-medium">완료 ✓</span>
        )}
      </div>

      {error && <p className="text-red-500 text-xs">{error}</p>}

      {result !== null && pluginId === 'dur' && (() => {
        const r = result as DurResult
        return (
          <div className={`rounded-lg p-3 text-sm ${r.status === 'safe' ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
            <p className={`font-medium ${r.status === 'safe' ? 'text-green-700' : 'text-yellow-700'}`}>
              {r.status === 'safe'
                ? '✓ 이상 없음 — 약물 상호작용 및 금기 검사 통과'
                : '⚠ 경고 — 아래 내용을 확인하세요'}
            </p>
            {r.warnings.length > 0 && (
              <ul className="mt-2 space-y-1 text-xs text-yellow-700">
                {r.warnings.map((w, i) => (
                  <li key={i}>• {w.message}</li>
                ))}
              </ul>
            )}
            <p className="text-xs text-gray-400 mt-2">검사 시각: {String(r.checkedAt).slice(0, 10)}</p>
          </div>
        )
      })()}

      {result !== null && pluginId === 'medication-guide' && (() => {
        const r = result as MedGuideResult
        return (
          <ul className="space-y-2">
            {r.guides.length === 0
              ? <li className="text-xs text-gray-400">처방 항목이 없습니다.</li>
              : r.guides.map((g, i) => (
                <li key={i} className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                  <p className="font-medium text-blue-800 text-sm">{g.drug_name}</p>
                  <p className="text-blue-600 text-xs mt-1">복용법: {g.how_to_take}</p>
                  {g.warnings.map((w, j) => (
                    <p key={j} className="text-blue-500 text-xs">• {w}</p>
                  ))}
                </li>
              ))
            }
          </ul>
        )
      })()}
    </div>
  )
}
