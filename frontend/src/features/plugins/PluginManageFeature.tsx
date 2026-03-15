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

  if (loading) return (
    <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 text-sm py-8">
      <Spinner size="md" className="text-gray-400" />
      <span>플러그인 목록을 불러오는 중...</span>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <span>🔌</span> Plugin 관리
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">각 단계에서 실행할 확장 기능을 관리합니다.</p>
          </div>
          <Link
            to="/reception"
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 transition-colors"
          >
            ← 접수로 돌아가기
          </Link>
        </div>

        {plugins.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center text-gray-400 dark:text-gray-500 shadow-sm">
            등록된 Plugin이 없습니다.
          </div>
        ) : (
          <ul className="space-y-3">
            {plugins.map((plugin) => (
              <li key={plugin.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-xl">
                    🔌
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">{plugin.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{plugin.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${plugin.enabled ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                    {plugin.enabled ? '✅ 활성' : '⭕ 비활성'}
                  </span>
                  <button
                    onClick={() => handleToggle(plugin)}
                    disabled={toggling === plugin.id}
                    className={[
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 dark:focus:ring-offset-gray-800 disabled:opacity-50',
                      plugin.enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600',
                    ].join(' ')}
                    role="switch"
                    aria-checked={plugin.enabled}
                  >
                    <span
                      className={[
                        'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
                        plugin.enabled ? 'translate-x-6' : 'translate-x-1',
                      ].join(' ')}
                    />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
