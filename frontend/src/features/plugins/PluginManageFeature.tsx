import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { usePluginStore } from '@/stores/pluginStore'
import { usePluginList, usePluginToggle } from '@/hooks/usePlugin'
import { useToast } from '@/hooks/useToast'
import Spinner from '@/components/ui/Spinner'
import type { Plugin } from '@/types'

export default function PluginManageFeature() {
  const { plugins, setPlugins, togglePlugin } = usePluginStore()
  const { plugins: fetched, loading, error: listError } = usePluginList()
  const { toggling, toggle } = usePluginToggle()
  const { toast } = useToast()

  useEffect(() => {
    if (fetched.length > 0) setPlugins(fetched)
  }, [fetched, setPlugins])
  useEffect(() => { if (listError) toast('error', listError) }, [listError, toast])

  const handleToggle = async (plugin: Plugin) => {
    const nextEnabled = !plugin.enabled
    const updated = await toggle(plugin.id, nextEnabled)
    if (updated) {
      togglePlugin(plugin.id, nextEnabled)
      toast('success', `${plugin.name}이(가) ${nextEnabled ? '활성화' : '비활성화'}되었습니다.`)
    } else {
      toast('error', 'Plugin 설정 변경에 실패했습니다.')
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-amber-500 dark:text-amber-400">
              설정
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Plugin 관리</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-500">각 단계에서 실행할 확장 기능을 관리합니다.</p>
          </div>
          <Link
            to="/reception"
            className="text-xs text-zinc-400 dark:text-zinc-600 hover:text-amber-500 dark:hover:text-amber-400 transition-colors flex items-center gap-1.5"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15,18 9,12 15,6" />
            </svg>
            접수로 돌아가기
          </Link>
        </div>

        {loading && (
          <div className="flex items-center gap-3 text-zinc-400 dark:text-zinc-600 text-sm py-8">
            <Spinner size="md" className="text-zinc-400" />
            <span>플러그인 목록을 불러오는 중...</span>
          </div>
        )}

        {!loading && plugins.length === 0 && (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-8 text-center text-zinc-400 dark:text-zinc-600 text-sm">
            등록된 Plugin이 없습니다.
          </div>
        )}

        {!loading && plugins.length > 0 && (
          <ul className="space-y-2">
            {plugins.map((plugin) => (
              <li
                key={plugin.id}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-5 flex items-center justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
              >
                {/* Info */}
                <div className="flex items-center gap-4">
                  {/* Icon placeholder */}
                  <div className={[
                    'w-9 h-9 rounded border flex items-center justify-center flex-shrink-0',
                    plugin.enabled
                      ? 'border-amber-400/30 bg-amber-400/5'
                      : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950',
                  ].join(' ')}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                      className={plugin.enabled ? 'text-amber-500 dark:text-amber-400' : 'text-zinc-400 dark:text-zinc-600'}>
                      <path d="M18.5 3a2.5 2.5 0 0 1 0 5h-1v2h1a4.5 4.5 0 0 1 0 9H15v-2h3.5a2.5 2.5 0 0 0 0-5H17V9h1.5a.5.5 0 0 0 0-1H17V3h1.5zM9 3v3H7.5a.5.5 0 0 0 0 1H9v3H7.5a2.5 2.5 0 0 0 0 5H9v2H5.5a4.5 4.5 0 0 1 0-9H7V8H5.5a2.5 2.5 0 0 1 0-5H9z" />
                    </svg>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{plugin.name}</p>
                      <span className={[
                        'text-[10px] font-semibold tracking-wide px-1.5 py-0.5 rounded-sm',
                        plugin.enabled
                          ? 'text-amber-600 dark:text-amber-400 bg-amber-400/10'
                          : 'text-zinc-400 dark:text-zinc-600 bg-zinc-100 dark:bg-zinc-800',
                      ].join(' ')}>
                        {plugin.enabled ? 'ON' : 'OFF'}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-0.5">{plugin.description}</p>
                  </div>
                </div>

                {/* Toggle switch */}
                <button
                  onClick={() => handleToggle(plugin)}
                  disabled={toggling === plugin.id}
                  className={[
                    'relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none disabled:opacity-40',
                    plugin.enabled ? 'bg-amber-400' : 'bg-zinc-200 dark:bg-zinc-700',
                  ].join(' ')}
                  role="switch"
                  aria-checked={plugin.enabled}
                >
                  <span
                    className={[
                      'inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform',
                      plugin.enabled ? 'translate-x-4' : 'translate-x-0.5',
                    ].join(' ')}
                  />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
