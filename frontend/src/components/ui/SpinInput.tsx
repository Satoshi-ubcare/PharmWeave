import { cn } from '@/lib/cn'

interface SpinInputProps {
  value: number
  min?: number
  max?: number
  onChange: (value: number) => void
  className?: string
}

export default function SpinInput({ value, min = 1, max = 999, onChange, className }: SpinInputProps) {
  const dec = () => { if (value > min) onChange(value - 1) }
  const inc = () => { if (value < max) onChange(value + 1) }

  const btnBase = cn(
    'w-7 h-8 flex items-center justify-center text-zinc-500 dark:text-zinc-400',
    'border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-950',
    'hover:bg-blue-50 dark:hover:bg-zinc-800 hover:text-blue-600 dark:hover:text-blue-400',
    'disabled:opacity-30 disabled:cursor-not-allowed',
    'transition-colors select-none text-base font-medium leading-none',
  )

  return (
    <div className={cn('inline-flex items-center', className)}>
      <button type="button" onClick={dec} disabled={value <= min}
        className={cn(btnBase, 'rounded-l-lg border-r-0')}>
        −
      </button>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => {
          const v = parseInt(e.target.value, 10)
          if (!isNaN(v)) onChange(Math.max(min, Math.min(max, v)))
        }}
        className="w-11 h-8 text-center bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:border-blue-500 tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <button type="button" onClick={inc} disabled={value >= max}
        className={cn(btnBase, 'rounded-r-lg border-l-0')}>
        +
      </button>
    </div>
  )
}
