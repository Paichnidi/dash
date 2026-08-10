import { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import { useLocalState } from './storage'
import { useVisibilityPoll } from './polling'
import type { UserSettings, WidgetId } from '../types'

const DEFAULT_WIDGET_ORDER: WidgetId[] = [
  'daily', 'weather', 'airport', 'calendar', 'tasks', 'flight', 'school', 'launch',
]

export const DEFAULT_SETTINGS: UserSettings = {
  name: 'Pilot',
  favoriteAirport: 'KHQU',
  homeLat: 34.2632,
  homeLon: -82.1207,
  homeLabel: 'Greenwood, SC',
  theme: 'dark',
  accent: '#4C7FE0',
  widgets: DEFAULT_WIDGET_ORDER.map((id) => ({ id, label: labelFor(id), enabled: true })),
  layoutOrder: DEFAULT_WIDGET_ORDER,
}

function labelFor(id: WidgetId) {
  const map: Record<WidgetId, string> = {
    daily: 'Daily Overview',
    calendar: 'Calendar',
    tasks: 'Tasks',
    weather: 'Weather',
    airport: 'Airport',
    flight: 'Flight Progress',
    school: 'School',
    launch: 'Quick Launch',
  }
  return map[id]
}

const SYNC_ENDPOINT = '/api/settings-sync'
const SYNC_POLL_MS = 20 * 1000
const PUSH_DEBOUNCE_MS = 1500

type SyncStatus = 'idle' | 'synced' | 'unconfigured' | 'error'

interface SyncEnvelope {
  settings: UserSettings
  updatedAt: string
}

interface SettingsContextValue {
  settings: UserSettings
  setSettings: (updater: (s: UserSettings) => UserSettings) => void
  resetSettings: () => void
  syncStatus: SyncStatus
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setRaw] = useLocalState<UserSettings>('hub.settings.v1', DEFAULT_SETTINGS)
  const [lastAppliedUpdatedAt, setLastAppliedUpdatedAt] = useLocalState<string | null>(
    'hub.settings.syncedAt.v1',
    null
  )
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle')
  const token = import.meta.env.VITE_INBOX_TOKEN as string | undefined

  // Prevents the "push local changes" effect from firing right after we've just
  // *applied* a remote update — otherwise every pull would immediately echo back
  // as a push, and every fresh mount would push its defaults before ever pulling.
  const skipNextPush = useRef(true)
  const settingsRef = useRef(settings)
  settingsRef.current = settings

  const setSettings = (updater: (s: UserSettings) => UserSettings) => {
    setRaw((prev) => updater(prev))
  }

  const resetSettings = () => setRaw(DEFAULT_SETTINGS)

  const pushNow = useCallback(async () => {
    if (!token) return
    try {
      const res = await fetch(SYNC_ENDPOINT, {
        method: 'PUT',
        headers: { 'content-type': 'application/json', 'x-inbox-token': token },
        body: JSON.stringify(settingsRef.current),
      })
      if (!res.ok) {
        setSyncStatus('error')
        return
      }
      const saved: SyncEnvelope = await res.json()
      setLastAppliedUpdatedAt(saved.updatedAt)
      setSyncStatus('synced')
    } catch {
      setSyncStatus('error')
    }
  }, [token, setLastAppliedUpdatedAt])

  // Pull on a timer, immediately on mount, and immediately whenever the tab/PWA
  // regains focus (see useVisibilityPoll — iOS Safari suspends plain setInterval
  // timers while backgrounded, so this closes that gap).
  useVisibilityPoll(
    async () => {
      if (!token) {
        setSyncStatus('unconfigured')
        return
      }
      try {
        const res = await fetch(SYNC_ENDPOINT, { headers: { 'x-inbox-token': token } })
        if (res.status === 404) {
          // Nothing saved remotely yet — seed it with whatever this device has now.
          skipNextPush.current = false
          await pushNow()
          return
        }
        if (!res.ok) {
          setSyncStatus('error')
          return
        }
        const remote: SyncEnvelope = await res.json()
        if (!lastAppliedUpdatedAt || remote.updatedAt > lastAppliedUpdatedAt) {
          skipNextPush.current = true
          setRaw(remote.settings)
          setLastAppliedUpdatedAt(remote.updatedAt)
        }
        setSyncStatus('synced')
      } catch {
        setSyncStatus('error')
      }
    },
    SYNC_POLL_MS,
    true
  )

  // Push local edits to the server, debounced so typing (e.g. into the lat/lon
  // fields) doesn't fire a request per keystroke.
  useEffect(() => {
    if (!token) return
    if (skipNextPush.current) {
      skipNextPush.current = false
      return
    }
    const t = setTimeout(() => { pushNow() }, PUSH_DEBOUNCE_MS)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings, token])

  // apply theme to <html>
  useEffect(() => {
    const root = document.documentElement
    const apply = (dark: boolean) => root.classList.toggle('dark', dark)
    if (settings.theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      apply(mq.matches)
      const listener = (e: MediaQueryListEvent) => apply(e.matches)
      mq.addEventListener('change', listener)
      return () => mq.removeEventListener('change', listener)
    }
    apply(settings.theme === 'dark')
  }, [settings.theme])

  useEffect(() => {
    document.documentElement.style.setProperty('--color-accent', settings.accent)
  }, [settings.accent])

  const value = useMemo(
    () => ({ settings, setSettings, resetSettings, syncStatus }),
    [settings, syncStatus]
  )

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}