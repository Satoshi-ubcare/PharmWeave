import { useToastStore } from '@/stores/toastStore'

const borderColors = {
  success: 'border-l-emerald-500',
  error: 'border-l-red-500',
  info: 'border-l-blue-500',
}

const iconColors = {
  success: 'text-emerald-400',
  error: 'text-red-400',
  info: 'text-blue-500',
}

const icons = {
  success: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="20,6 9,17 4,12" />
    </svg>
  ),
  error: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  info: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
}

export default function ToastContainer(): JSX.Element {
  const { toasts, removeToast } = useToastStore()

  return (
    <div
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="alert"
          className={[
            'flex items-start gap-3 px-4 py-3 rounded-xl shadow-2xl text-sm pointer-events-auto',
            'min-w-64 max-w-sm border-l-2 border border-zinc-800',
            'bg-zinc-900 text-zinc-100',
            borderColors[toast.type],
          ].join(' ')}
        >
          <span className={`mt-0.5 flex-shrink-0 ${iconColors[toast.type]}`}>
            {icons[toast.type]}
          </span>
          <span className="flex-1 text-zinc-200 leading-relaxed">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-zinc-600 hover:text-zinc-300 flex-shrink-0 w-4 h-4 flex items-center justify-center transition-colors mt-0.5"
            aria-label="닫기"
          >
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="1" y1="1" x2="11" y2="11" /><line x1="11" y1="1" x2="1" y2="11" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}
