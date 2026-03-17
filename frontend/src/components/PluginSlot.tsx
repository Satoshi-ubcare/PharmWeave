import { usePluginStore } from '@/stores/pluginStore'
import { usePluginExecute } from '@/hooks/usePlugin'
import Spinner from '@/components/ui/Spinner'

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

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-amber-500 dark:text-amber-400">
            Plugin
          </p>
          <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{plugin.name}</p>
          <p className="text-xs text-zinc-400 dark:text-zinc-600">{plugin.description}</p>
        </div>
        {!result ? (
          <button
            onClick={() => execute(pluginId, visitId)}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-semibold rounded transition-colors disabled:opacity-40"
          >
            {loading && <Spinner size="sm" className="text-zinc-950" />}
            {loading ? '실행 중' : '실행'}
          </button>
        ) : (
          <div className="flex items-center gap-1.5 text-emerald-500 text-xs font-medium">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20,6 9,17 4,12" />
            </svg>
            완료
          </div>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-400 border border-red-800/40 bg-red-950/20 px-3 py-2 rounded">{error}</p>
      )}

      {/* DUR Result */}
      {result !== null && pluginId === 'dur' && (() => {
        const r = result as DurResult
        const isSafe = r.status === 'safe'
        return (
          <div className={[
            'rounded p-4 space-y-2 text-sm border',
            isSafe
              ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
              : 'bg-amber-950/20 border-amber-800/40 text-amber-300',
          ].join(' ')}>
            <p className="font-medium">
              {isSafe ? '이상 없음 — 약물 상호작용 및 금기 검사 통과' : '경고 — 아래 내용을 확인하세요'}
            </p>
            {r.warnings.length > 0 && (
              <ul className="space-y-1 text-xs opacity-80">
                {r.warnings.map((w, i) => (
                  <li key={i} className="flex gap-1.5">
                    <span>·</span>
                    <span>{w.message}</span>
                  </li>
                ))}
              </ul>
            )}
            <p className="text-xs opacity-40">검사 시각: {String(r.checkedAt).slice(0, 10)}</p>
          </div>
        )
      })()}

      {/* Medication Guide Result */}
      {result !== null && pluginId === 'medication-guide' && (() => {
        const r = result as MedGuideResult
        return (
          <ul className="space-y-2">
            {r.guides.length === 0
              ? <li className="text-xs text-zinc-500">처방 항목이 없습니다.</li>
              : r.guides.map((g, i) => (
                <li key={i} className="bg-zinc-950 dark:bg-zinc-950 border border-zinc-800 rounded p-3 space-y-1">
                  <p className="text-xs font-semibold text-zinc-200">{g.drug_name}</p>
                  <p className="text-xs text-zinc-400">복용법: {g.how_to_take}</p>
                  {g.warnings.map((w, j) => (
                    <p key={j} className="text-xs text-zinc-500">· {w}</p>
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
