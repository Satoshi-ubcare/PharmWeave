import PluginManageFeature from '@/features/plugins/PluginManageFeature'

export default function PluginManagePage() {
  return (
    <div className="min-h-screen bg-[#EBFEFE] dark:bg-zinc-950">
      <header className="bg-white dark:bg-zinc-900 border-b border-blue-100 dark:border-zinc-800 px-8 py-4 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <div className="w-8 h-8 bg-[#246AFE] rounded-xl flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight text-[#0B0A0A] dark:text-zinc-100">PharmWeave</div>
            <div className="text-[10px] text-slate-400 dark:text-zinc-600 tracking-wide">플러그인 관리</div>
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-8 py-8">
        <PluginManageFeature />
      </main>
    </div>
  )
}
