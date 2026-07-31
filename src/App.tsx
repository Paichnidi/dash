import { useState } from 'react'
import { SettingsProvider, useSettings } from './lib/settings'
import { WidgetGrid } from './components/WidgetGrid'
import { SettingsPanel } from './components/SettingsPanel'
import { Settings, Sun, Moon } from 'lucide-react'

function Header({ onOpenSettings }: { onOpenSettings: () => void }) {
  const { settings, setSettings } = useSettings()
  const isDark = settings.theme === 'dark'

  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-2">
        <div
          className="w-2 h-2 rounded-full"
          style={{ background: 'var(--color-accent)' }}
        />
        <span className="font-mono text-[11px] tracking-[0.16em] uppercase text-muted dark:text-muted-dark">
          Hub
        </span>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => setSettings((s) => ({ ...s, theme: isDark ? 'light' : 'dark' }))}
          className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-muted dark:text-muted-dark"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-muted dark:text-muted-dark"
          aria-label="Settings"
        >
          <Settings size={16} />
        </button>
      </div>
    </div>
  )
}

function DashboardShell() {
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <div className="min-h-screen px-4 py-5 sm:px-8 sm:py-8 max-w-5xl mx-auto">
      <Header onOpenSettings={() => setSettingsOpen(true)} />
      <WidgetGrid />
      <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}

export default function App() {
  return (
    <SettingsProvider>
      <DashboardShell />
    </SettingsProvider>
  )
}
