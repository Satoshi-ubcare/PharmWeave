import { useSortable, SortableContext, rectSortingStrategy } from '@dnd-kit/sortable'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { useSortableLayout } from '@/hooks/useSortableLayout'

interface SortableGridItemProps {
  id: string
  children: React.ReactNode
}

function SortableGridItem({ id, children }: SortableGridItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={isDragging ? 'opacity-40 z-50 relative' : 'relative group/grid-item'}
    >
      {/* 드래그 핸들 */}
      <button
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        tabIndex={-1}
        title="드래그하여 순서 변경"
        className="absolute top-2.5 right-2.5 z-20 p-1.5 opacity-30 group-hover/grid-item:opacity-100 text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 cursor-grab active:cursor-grabbing rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all"
      >
        <svg width="12" height="12" viewBox="0 0 14 14" fill="currentColor">
          <circle cx="4" cy="2.5" r="1.4" />
          <circle cx="10" cy="2.5" r="1.4" />
          <circle cx="4" cy="7" r="1.4" />
          <circle cx="10" cy="7" r="1.4" />
          <circle cx="4" cy="11.5" r="1.4" />
          <circle cx="10" cy="11.5" r="1.4" />
        </svg>
      </button>
      {children}
    </div>
  )
}

interface SortableGridProps {
  pageId: string
  defaultOrder: string[]
  items: Record<string, React.ReactNode>
  className?: string
}

export default function SortableGrid({ pageId, defaultOrder, items, className }: SortableGridProps) {
  const { ids, handleDragEnd } = useSortableLayout(pageId, defaultOrder)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={ids} strategy={rectSortingStrategy}>
        <div className={className}>
          {ids.map((id) => (
            <SortableGridItem key={id} id={id}>
              {items[id]}
            </SortableGridItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
