import { useEffect, useState } from 'react'
import type { CalendarEvent } from '../types'

interface CaldavApiEvent {
    id: string
    title: string
    date: string
    time?: string
    location?: string
    allDay: boolean
    source: 'caldav'
}

const ENDPOINT = '/api/caldav-events'
const REFRESH_MS = 5 * 60 * 1000 // 5 minutes

/**
 * Fetches events from the CalDAV Netlify Function.
 * Returns an empty array (no error thrown to the UI) if CalDAV isn't configured
 * or the request fails — the dashboard should keep working with local events only.
 */
export function useCaldavEvents() {
    const [events, setEvents] = useState<CalendarEvent[]>([])
    const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'unconfigured' | 'error'>('idle')

    useEffect(() => {
        let cancelled = false

        const load = async () => {
            setStatus((s) => (s === 'idle' ? 'loading' : s))
            try {
                const res = await fetch(ENDPOINT)
                if (res.status === 500) {
                    if (!cancelled) { setStatus('unconfigured'); setEvents([]) }
                    return
                }
                if (!res.ok) throw new Error(`CalDAV sync failed (${res.status})`)
                const data: CaldavApiEvent[] = await res.json()
                if (!cancelled) {
                    setEvents(
                        data.map((e) => ({
                            id: `caldav:${e.id}`,
                            title: e.title,
                            date: e.date,
                            time: e.time,
                            location: e.location,
                            allDay: e.allDay,
                            type: 'personal',
                            source: 'caldav' as const,
                        }))
                    )
                    setStatus('ok')
                }
            } catch {
                if (!cancelled) setStatus('error')
            }
        }

        load()
        const t = setInterval(load, REFRESH_MS)
        return () => { cancelled = true; clearInterval(t) }
    }, [])

    return { events, status }
}