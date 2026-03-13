import PluginManageFeature from '@/features/plugins/PluginManageFeature'

export default function PluginManagePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-700 text-white px-6 py-3">
        <span className="text-xl font-bold">PharmWeave — Plugin 관리</span>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-8">
        <PluginManageFeature />
      </main>
    </div>
  )
}
