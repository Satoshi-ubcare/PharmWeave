import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface Props {
  id: string
  children: React.ReactNode
}

export default function SortableSection({ id, children }: Props) {
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
    <div ref={setNodeRef} style={style} className={isDragging ? 'opacity-40 z-50 relative' : 'relative'}>
      <div className="relative group/section">
        {/* 드래그 핸들 — hover 시 표시 */}
        <button
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          tabIndex={-1}
          title="드래그하여 순서 변경"
          className="absolute top-3 right-3 z-20 p-1.5 opacity-30 group-hover/section:opacity-100 text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 cursor-grab active:cursor-grabbing rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all"
        >
          {/* 6-dot grip icon */}
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
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
    </div>
  )
}
