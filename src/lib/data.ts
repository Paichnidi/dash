import { useMemo } from 'react'
import { useCaldavEvents } from './caldav'
import { useLocalState, uid } from './storage'
import type {
  Task, CalendarEvent, ClassEntry, Assignment, FlightProgress, QuickLink,
} from '../types'
import { textPath } from 'framer-motion/client'

function todayISO(offsetDays = 0) {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString().slice(0, 10)
}

const SEED_TASKS: Task[] = [
]

const SEED_EVENTS: CalendarEvent[] = [
  
]

const SEED_CLASSES: ClassEntry[] = [
  { id: uid(), name: 'Human Communications', days: ['Tue', 'Thu'], time: '11:00 AM', room: 'Russel 310' },
  { id: uid(), name: 'Elementary Statistics', days: ['Tue', 'Thu'], time: '2:00 PM', room: 'Memori 138' },
  { id: uid(), name: 'Instrument Pilot Ground', days: ['Mon', 'Wed'], time: '9:30 AM', room: 'GA_FLI 2012' },
  { id: uid(), name: 'Aviation Meteorology', days: ['Mon', 'Wed'], time: '11:00 AM', room: 'Eastman' },
  { id: uid(), name: 'Aviation Regulation', days: ['online'], time: '2:00 PM', room: '' },
]

const SEED_ASSIGNMENTS: Assignment[] = [
]

const SEED_FLIGHT: FlightProgress = {
  totalHours: 67.4,
  certificates: [
    { id: uid(), name: 'Private Pilot', progressHours: 61, goalHours: 40, complete: true },
    { id: uid(), name: 'Commercial', progressHours: 67.4, goalHours: 250, complete: false },
  ],
  currency: {},
  goals: ['Instrument Rating', 'Commercial Pilot', 'CFI'],
}

const SEED_LINKS: QuickLink[] = [
  { id: uid(), label: 'ForeFlight', url: 'https://foreflight.com' },
  { id: uid(), label: 'Canvas', url: 'https://canvas.instructure.com' },
  { id: uid(), label: 'Email', url: 'https://mail.google.com' },
  { id: uid(), label: 'Weather Radar', url: 'https://radar.weather.gov' },
  { id: uid(), label: 'FAA Resources', url: 'https://www.faa.gov' },
]

export function useTasks() {
  return useLocalState<Task[]>('hub.tasks.v1', SEED_TASKS)
}

export function useEvents() {
  return useLocalState<CalendarEvent[]>('hub.events.v1', SEED_EVENTS)
}

/**
 * Combines locally-created events (editable) with events synced from CalDAV
 * (read-only, refreshed periodically). Synced events carry `source: 'caldav'`
 * and a `caldav:`-prefixed id so they never collide with local ids.
 */
export function useMergedEvents() {
  const [localEvents, setLocalEvents] = useEvents()
  const { events: caldavEvents, status: caldavStatus } = useCaldavEvents()

  const merged = useMemo(
    () =>
      [...localEvents, ...caldavEvents].sort((a, b) =>
        (a.date + (a.time ?? '')).localeCompare(b.date + (b.time ?? ''))
      ),
    [localEvents, caldavEvents]
  )

  return { events: merged, setLocalEvents, caldavStatus }
}

export function useClasses() {
  return useLocalState<ClassEntry[]>('hub.classes.v1', SEED_CLASSES)
}

export function useAssignments() {
  return useLocalState<Assignment[]>('hub.assignments.v1', SEED_ASSIGNMENTS)
}

export function useFlightProgress() {
  return useLocalState<FlightProgress>('hub.flight.v1', SEED_FLIGHT)
}

export function useQuickLinks() {
  return useLocalState<QuickLink[]>('hub.links.v1', SEED_LINKS)
}
