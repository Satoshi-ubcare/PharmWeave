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
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-indigo-100 dark:border-indigo-900/50 p-5 space-y-3 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{plugin.name}</h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{plugin.description}</p>
        </div>
        {!result ? (
          <button
            onClick={handleExecute}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {loading ? '⏳ 실행 중...' : '▶ 실행'}
          </button>
        ) : (
          <span className="text-xs text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
            <span>✅</span>
            <span>완료</span>
          </span>
        )}
      </div>

      {error && <p className="text-red-500 dark:text-red-400 text-xs">⚠️ {error}</p>}

      {result !== null && pluginId === 'dur' && (() => {
        const r = result as DurResult
        return (
          <div className={`rounded-lg p-3 text-sm ${r.status === 'safe' ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'}`}>
            <p className={`font-medium ${r.status === 'safe' ? 'text-green-700 dark:text-green-400' : 'text-yellow-700 dark:text-yellow-400'}`}>
              {r.status === 'safe'
                ? '✅ 이상 없음 — 약물 상호작용 및 금기 검사 통과'
                : '⚠️ 경고 — 아래 내용을 확인하세요'}
            </p>
            {r.warnings.length > 0 && (
              <ul className="mt-2 space-y-1 text-xs text-yellow-700 dark:text-yellow-400">
                {r.warnings.map((w, i) => (
                  <li key={i}>• {w.message}</li>
                ))}
              </ul>
            )}
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">검사 시각: {String(r.checkedAt).slice(0, 10)}</p>
          </div>
        )
      })()}

      {result !== null && pluginId === 'medication-guide' && (() => {
        const r = result as MedGuideResult
        return (
          <ul className="space-y-2">
            {r.guides.length === 0
              ? <li className="text-xs text-gray-400 dark:text-gray-500">처방 항목이 없습니다.</li>
              : r.guides.map((g, i) => (
                <li key={i} className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-3">
                  <p className="font-medium text-blue-800 dark:text-blue-300 text-sm">💊 {g.drug_name}</p>
                  <p className="text-blue-600 dark:text-blue-400 text-xs mt-1">📌 복용법: {g.how_to_take}</p>
                  {g.warnings.map((w, j) => (
                    <p key={j} className="text-blue-500 dark:text-blue-500 text-xs">• {w}</p>
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
