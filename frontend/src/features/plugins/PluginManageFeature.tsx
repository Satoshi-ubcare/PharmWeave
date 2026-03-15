import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { usePluginStore } from '@/stores/pluginStore'
import { usePluginList, usePluginToggle } from '@/hooks/usePlugin'
import type { Plugin } from '@/types'

export default function PluginManageFeature() {
  const { plugins, setPlugins, togglePlugin } = usePluginStore()
  const { plugins: fetched, loading } = usePluginList()
  const { toggling, toggle } = usePluginToggle()

  useEffect(() => {
    if (fetched.length > 0) setPlugins(fetched)
  }, [fetched, setPlugins])

  const handleToggle = async (plugin: Plugin) => {
    const updated = await toggle(plugin.id, !plugin.enabled)
    if (updated) togglePlugin(plugin.id, !plugin.enabled)
  }

  if (loading) return <p className="text-gray-400 text-sm">플러그인 목록을 불러오는 중...</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Plugin 관리</h1>
          <p className="text-gray-500 text-sm mt-1">각 단계에서 실행할 확장 기능을 관리합니다.</p>
        </div>
        <Link to="/reception" className="text-sm text-blue-600 hover:text-blue-700">← 접수로 돌아가기</Link>
      </div>

      {plugins.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
          등록된 Plugin이 없습니다.
        </div>
      ) : (
        <ul className="space-y-3">
          {plugins.map((plugin) => (
            <li key={plugin.id} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-800">{plugin.name}</p>
                <p className="text-sm text-gray-500 mt-0.5">{plugin.description}</p>
              </div>
              <button
                onClick={() => handleToggle(plugin)}
                disabled={toggling === plugin.id}
                className={[
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50',
                  plugin.enabled ? 'bg-blue-600' : 'bg-gray-300',
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
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
