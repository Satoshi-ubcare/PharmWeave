import { useEffect } from 'react'
import { cn } from '@/lib/cn'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'default'
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = '확인',
  cancelLabel = '취소',
  variant = 'default',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Panel */}
      <div className="relative bg-zinc-900 border border-zinc-800 rounded shadow-2xl w-full max-w-sm mx-4 p-6 space-y-4">
        {/* Header */}
        <div className="space-y-1.5">
          <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-amber-500">
            {variant === 'danger' ? '주의' : '확인'}
          </p>
          <h2 id="confirm-title" className="text-base font-semibold text-zinc-100">
            {title}
          </h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end pt-1">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200 text-sm rounded transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded transition-colors',
              variant === 'danger'
                ? 'bg-red-500/10 border border-red-700 text-red-400 hover:bg-red-500/20'
                : 'bg-amber-400 hover:bg-amber-300 text-zinc-950 font-semibold',
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
