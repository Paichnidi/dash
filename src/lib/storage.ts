import { useEffect, useState } from 'react'

export function useLocalState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? (JSON.parse(raw) as T) : initial
    } catch {
      return initial
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // storage full or unavailable — fail silently, dashboard still works in-memory
    }
  }, [key, value])

  return [value, setValue] as const
}

export function uid() {
  return Math.random().toString(36).slice(2, 10)
}
