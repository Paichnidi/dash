import { DAVClient } from 'tsdav'
import ical, { type CalendarResponse } from 'node-ical'
import type { Config, Context } from '@netlify/functions'

interface SyncedEvent {
    id: string
    title: string
    date: string // yyyy-mm-dd
    time?: string // HH:MM
    location?: string
    allDay: boolean
    source: 'caldav'
}

function toLocalParts(d: Date, allDay: boolean) {
    const date = d.toISOString().slice(0, 10)
    if (allDay) return { date, time: undefined }
    const time = d.toTimeString().slice(0, 5)
    return { date, time }
}

function textValue(v: unknown): string | undefined {
    if (v == null) return undefined
    if (typeof v === 'string') return v
    if (typeof v === 'object' && 'val' in (v as any)) return String((v as any).val)
    return String(v)
}

export default async (_req: Request, _context: Context) => {
    const serverUrl = process.env.CALDAV_URL
    const username = process.env.CALDAV_USERNAME
    const password = process.env.CALDAV_PASSWORD

    if (!serverUrl || !username || !password) {
        return new Response(
            JSON.stringify({ error: 'CalDAV is not configured. Set CALDAV_URL, CALDAV_USERNAME, CALDAV_PASSWORD in Netlify environment variables.' }),
            { status: 500, headers: { 'content-type': 'application/json' } }
        )
    }

    try {
        const client = new DAVClient({
            serverUrl,
            credentials: { username, password },
            authMethod: 'Basic',
            defaultAccountType: 'caldav',
        })
        await client.login()

        const calendars = await client.fetchCalendars()

        const now = new Date()
        const rangeStart = new Date(now)
        rangeStart.setDate(rangeStart.getDate() - 7)
        const rangeEnd = new Date(now)
        rangeEnd.setDate(rangeEnd.getDate() + 60)

        const events: SyncedEvent[] = []

        for (const calendar of calendars) {
            const objects = await client.fetchCalendarObjects({
                calendar,
                timeRange: { start: rangeStart.toISOString(), end: rangeEnd.toISOString() },
            })

            for (const obj of objects) {
                if (!obj.data) continue
                let parsed: CalendarResponse
                try {
                    parsed = ical.parseICS(obj.data)
                } catch {
                    continue
                }
                for (const key in parsed) {
                    const item = parsed[key]
                    if (!item || item.type !== 'VEVENT' || !item.start) continue
                    const start = new Date(item.start as unknown as string)
                    if (start < rangeStart || start > rangeEnd) continue
                    const allDay = (item.start as any).dateOnly === true
                    const { date, time } = toLocalParts(start, allDay)
                    events.push({
                        id: item.uid ?? key,
                        title: textValue(item.summary) ?? 'Untitled event',
                        date,
                        time,
                        location: textValue(item.location),
                        allDay,
                        source: 'caldav',
                    })
                }
            }
        }

        events.sort((a, b) => (a.date + (a.time ?? '')).localeCompare(b.date + (b.time ?? '')))

        return new Response(JSON.stringify(events), {
            headers: { 'content-type': 'application/json', 'cache-control': 'private, max-age=300' },
        })
    } catch (err) {
        return new Response(
            JSON.stringify({ error: 'Failed to reach CalDAV server', detail: String(err) }),
            { status: 502, headers: { 'content-type': 'application/json' } }
        )
    }
}

export const config: Config = {
    path: '/api/caldav-events',
}