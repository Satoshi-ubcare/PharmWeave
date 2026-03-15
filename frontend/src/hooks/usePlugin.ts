import { useState, useEffect } from 'react'
import { pluginApi } from '@/api/endpoints'
import type { Plugin } from '@/types'

export function usePluginList() {
  const [plugins, setPlugins] = useState<Plugin[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    pluginApi
      .list()
      .then((res) => setPlugins(res.data))
      .finally(() => setLoading(false))
  }, [])

  return { plugins, setPlugins, loading }
}

export function usePluginToggle() {
  const [toggling, setToggling] = useState<string | null>(null)

  const toggle = async (id: string, enabled: boolean): Promise<Plugin | null> => {
    setToggling(id)
    try {
      const res = await pluginApi.toggle(id, enabled)
      return res.data
    } finally {
      setToggling(null)
    }
  }

  return { toggling, toggle }
}

export function usePluginExecute() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<unknown>(null)
  const [error, setError] = useState('')

  const execute = async (pluginId: string, visitId: string): Promise<unknown> => {
    setLoading(true)
    setError('')
    try {
      const res = await pluginApi.execute(pluginId, visitId)
      setResult(res.data)
      return res.data
    } catch {
      setError('Plugin 실행에 실패했습니다.')
      return null
    } finally {
      setLoading(false)
    }
  }

  return { loading, result, error, execute }
}
