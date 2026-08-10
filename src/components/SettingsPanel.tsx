import { ExpandedModal } from './ExpandedModal'
import { useSettings, DEFAULT_SETTINGS } from '../lib/settings'
import { RotateCcw } from 'lucide-react'

const ACCENTS = ['#4C7FE0', '#2FAE6E', '#D9A03E', '#B44FD1', '#E0654C', '#4FADBF']

export function SettingsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { settings, setSettings, resetSettings, syncStatus } = useSettings()

  return (
    <ExpandedModal open={open} onClose={onClose} title="Settings" tag="Personalization">
      <div className="space-y-6">
        <div>
          <label className="font-mono text-[10px] uppercase tracking-wider text-muted dark:text-muted-dark">Name</label>
          <input
            value={settings.name}
            onChange={(e) => setSettings((s) => ({ ...s, name: e.target.value }))}
            className="w-full mt-1 rounded-lg border border-hairline dark:border-hairline-dark bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-mono text-[10px] uppercase tracking-wider text-muted dark:text-muted-dark">Favorite Airport (ICAO)</label>
            <input
              value={settings.favoriteAirport}
              onChange={(e) => setSettings((s) => ({ ...s, favoriteAirport: e.target.value.toUpperCase() }))}
              className="w-full mt-1 rounded-lg border border-hairline dark:border-hairline-dark bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)] font-mono"
              maxLength={4}
            />
          </div>
          <div>
            <label className="font-mono text-[10px] uppercase tracking-wider text-muted dark:text-muted-dark">Home Location Label</label>
            <input
              value={settings.homeLabel}
              onChange={(e) => setSettings((s) => ({ ...s, homeLabel: e.target.value }))}
              className="w-full mt-1 rounded-lg border border-hairline dark:border-hairline-dark bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
            />
          </div>
          <div>
            <label className="font-mono text-[10px] uppercase tracking-wider text-muted dark:text-muted-dark">Latitude</label>
            <input
              type="number" step="0.0001"
              value={settings.homeLat}
              onChange={(e) => setSettings((s) => ({ ...s, homeLat: Number(e.target.value) }))}
              className="w-full mt-1 rounded-lg border border-hairline dark:border-hairline-dark bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)] font-mono"
            />
          </div>
          <div>
            <label className="font-mono text-[10px] uppercase tracking-wider text-muted dark:text-muted-dark">Longitude</label>
            <input
              type="number" step="0.0001"
              value={settings.homeLon}
              onChange={(e) => setSettings((s) => ({ ...s, homeLon: Number(e.target.value) }))}
              className="w-full mt-1 rounded-lg border border-hairline dark:border-hairline-dark bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)] font-mono"
            />
          </div>
        </div>

        <div>
          <label className="font-mono text-[10px] uppercase tracking-wider text-muted dark:text-muted-dark">Theme</label>
          <div className="flex gap-2 mt-1.5">
            {(['light', 'dark', 'system'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setSettings((s) => ({ ...s, theme: t }))}
                className={`flex-1 rounded-lg py-2 text-sm capitalize border transition-colors ${settings.theme === t
                    ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
                    : 'border-hairline dark:border-hairline-dark text-muted dark:text-muted-dark'
                  }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="font-mono text-[10px] uppercase tracking-wider text-muted dark:text-muted-dark">Accent Color</label>
          <div className="flex gap-2 mt-1.5">
            {ACCENTS.map((c) => (
              <button
                key={c}
                onClick={() => setSettings((s) => ({ ...s, accent: c }))}
                className="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110"
                style={{ background: c, borderColor: settings.accent === c ? c : 'transparent', boxShadow: settings.accent === c ? `0 0 0 2px var(--color-surface), 0 0 0 3.5px ${c}` : 'none' }}
                aria-label={c}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="font-mono text-[10px] uppercase tracking-wider text-muted dark:text-muted-dark">Widgets</label>
          <div className="space-y-1 mt-1.5">
            {settings.widgets.map((w) => (
              <label key={w.id} className="flex items-center justify-between py-1.5 text-sm">
                {w.label}
                <input
                  type="checkbox"
                  checked={w.enabled}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      widgets: s.widgets.map((ww) => (ww.id === w.id ? { ...ww, enabled: e.target.checked } : ww)),
                    }))
                  }
                  className="accent-[var(--color-accent)] w-4 h-4"
                />
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-muted dark:text-muted-dark">
          {syncStatus === 'synced' && (
            <>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-vfr)' }} />
              <span>Synced across devices</span>
            </>
          )}
          {syncStatus === 'unconfigured' && <span>Cross-device sync not configured — settings stay on this device only</span>}
          {syncStatus === 'error' && (
            <>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-ifr)' }} />
              <span>Sync unavailable — using local settings</span>
            </>
          )}
        </div>

        <button
          onClick={resetSettings}
          className="flex items-center gap-1.5 text-sm text-muted dark:text-muted-dark hover:text-ink dark:hover:text-ink-dark"
        >
          <RotateCcw size={13} /> Reset to defaults
        </button>
        <p className="text-[11px] text-muted dark:text-muted-dark leading-relaxed border-t border-hairline dark:border-hairline-dark pt-3">
          Default location: {DEFAULT_SETTINGS.homeLabel}. Settings sync automatically across your devices when configured; otherwise they stay local to this browser.
        </p>
      </div>
    </ExpandedModal>
  )
}