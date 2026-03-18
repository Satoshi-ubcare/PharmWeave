import { useState, useCallback } from 'react'
import { arrayMove } from '@dnd-kit/sortable'
import type { DragEndEvent } from '@dnd-kit/core'

export function useSortableLayout(pageId: string, defaultIds: string[]) {
  const storageKey = `pw:layout:${pageId}`

  const [ids, setIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const parsed = JSON.parse(stored) as string[]
        if (Array.isArray(parsed)) {
          // 저장된 순서 유지 + 새로 추가된 섹션 뒤에 붙임
          const ordered = [
            ...parsed.filter((id) => defaultIds.includes(id)),
            ...defaultIds.filter((id) => !parsed.includes(id)),
          ]
          if (ordered.length > 0) return ordered
        }
      }
    } catch {}
    return defaultIds
  })

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (over && active.id !== over.id) {
        setIds((prev) => {
          const oldIndex = prev.indexOf(active.id as string)
          const newIndex = prev.indexOf(over.id as string)
          const next = arrayMove(prev, oldIndex, newIndex)
          try {
            localStorage.setItem(storageKey, JSON.stringify(next))
          } catch {}
          return next
        })
      }
    },
    [storageKey],
  )

  return { ids, handleDragEnd }
}
