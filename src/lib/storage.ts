import { useCallback, useSyncExternalStore } from 'react'

type Listener = () => void

const listeners: Record<string, Set<Listener>> = {}
const cache: Record<string, unknown> = {}
const hasCached: Record<string, boolean> = {}

function readInitial<T>(key: string, initial: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : initial
  } catch {
    return initial
  }
}

function getSnapshot<T>(key: string, initial: T): T {
  if (!hasCached[key]) {
    cache[key] = readInitial(key, initial)
    hasCached[key] = true
  }
  return cache[key] as T
}

function emitChange(key: string) {
  listeners[key]?.forEach((l) => l())
}

/**
 * localStorage-backed state, shared across every component that reads the same key.
 * Uses a module-level cache + subscriber list (via useSyncExternalStore) so that when
 * one part of the app (e.g. a background sync hook) updates a key, every other component
 * reading that same key re-renders immediately — no page reload required.
 */
export function useLocalState<T>(key: string, initial: T) {
  const subscribe = useCallback(
    (callback: Listener) => {
      listeners[key] ??= new Set()
      listeners[key].add(callback)
      return () => listeners[key]?.delete(callback)
    },
    [key]
  )

  const getSnap = useCallback(() => getSnapshot(key, initial), [key])

  const value = useSyncExternalStore(subscribe, getSnap)

  const setValue = useCallback(
    (updater: T | ((prev: T) => T)) => {
      const current = getSnapshot(key, initial)
      const next = typeof updater === 'function' ? (updater as (prev: T) => T)(current) : updater
      cache[key] = next
      hasCached[key] = true
      try {
        localStorage.setItem(key, JSON.stringify(next))
      } catch {
        // storage full or unavailable — fail silently, dashboard still works in-memory
      }
      emitChange(key)
    },
    [key]
  )

  return [value, setValue] as const
}

export function uid() {
  return Math.random().toString(36).slice(2, 10)
}