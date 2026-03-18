import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useSortableLayout } from '@/hooks/useSortableLayout'
import SortableSection from './SortableSection'

interface Props {
  pageId: string
  defaultOrder: string[]
  /** id → ReactNode 맵. null/undefined 섹션은 렌더링 생략 */
  sections: Record<string, React.ReactNode>
  className?: string
}

export default function SortableLayout({
  pageId,
  defaultOrder,
  sections,
  className = 'space-y-6',
}: Props) {
  const { ids, handleDragEnd } = useSortableLayout(pageId, defaultOrder)

  // null/undefined 섹션은 sortable items에서 제외 (조건부 렌더링 지원)
  const visibleIds = ids.filter((id) => sections[id] != null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  )

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={visibleIds} strategy={verticalListSortingStrategy}>
        <div className={className}>
          {ids.map((id) =>
            sections[id] != null ? (
              <SortableSection key={id} id={id}>
                {sections[id]}
              </SortableSection>
            ) : null,
          )}
        </div>
      </SortableContext>
    </DndContext>
  )
}
