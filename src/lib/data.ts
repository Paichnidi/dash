import { useMemo } from 'react'
import { useCaldavEvents } from './caldav'
import { useLocalState, uid } from './storage'
import type {
  Task, CalendarEvent, ClassEntry, Assignment, FlightProgress, QuickLink,
} from '../types'

function todayISO(offsetDays = 0) {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString().slice(0, 10)
}

const SEED_TASKS: Task[] = [
  { id: uid(), title: 'Study weather theory', category: 'Aviation', priority: 'high', dueDate: todayISO(), done: false, createdAt: todayISO() },
  { id: uid(), title: 'Finish problem set 4', category: 'School', priority: 'medium', dueDate: todayISO(1), done: false, createdAt: todayISO() },
  { id: uid(), title: 'Laundry', category: 'Personal', priority: 'low', done: true, createdAt: todayISO() },
]

const SEED_EVENTS: CalendarEvent[] = [
  { id: uid(), title: 'Flight lesson', date: todayISO(), time: '08:00', location: 'KHQU', type: 'flight' },
  { id: uid(), title: 'Math 1030', date: todayISO(), time: '10:30', location: 'Room 118', type: 'class' },
]

const SEED_CLASSES: ClassEntry[] = [
  { id: uid(), name: 'Aviation Meteorology', days: ['Mon', 'Wed', 'Fri'], time: '10:30 AM', room: '204' },
  { id: uid(), name: 'Calculus II', days: ['Tue', 'Thu'], time: '9:00 AM', room: '118' },
]

const SEED_ASSIGNMENTS: Assignment[] = [
  { id: uid(), title: 'Weather brief write-up', course: 'Aviation Meteorology', dueDate: todayISO(1), done: false },
]

const SEED_FLIGHT: FlightProgress = {
  totalHours: 67.4,
  certificates: [
    { id: uid(), name: 'Private Pilot', progressHours: 61, goalHours: 40, complete: true },
    { id: uid(), name: 'Commercial', progressHours: 120, goalHours: 250, complete: false },
  ],
  currency: {},
  goals: ['Solo cross-country', 'Complex endorsement'],
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
