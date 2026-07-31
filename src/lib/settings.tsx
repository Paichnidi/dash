import { createContext, useContext, useEffect, useMemo } from 'react'
import type { ReactNode } from 'react'
import { useLocalState } from './storage'
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

interface SettingsContextValue {
  settings: UserSettings
  setSettings: (updater: (s: UserSettings) => UserSettings) => void
  resetSettings: () => void
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setRaw] = useLocalState<UserSettings>('hub.settings.v1', DEFAULT_SETTINGS)

  const setSettings = (updater: (s: UserSettings) => UserSettings) => {
    setRaw((prev) => updater(prev))
  }

  const resetSettings = () => setRaw(DEFAULT_SETTINGS)

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

  const value = useMemo(() => ({ settings, setSettings, resetSettings }), [settings])

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}
