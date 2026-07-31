export type WidgetId =
  | 'daily'
  | 'calendar'
  | 'tasks'
  | 'weather'
  | 'airport'
  | 'flight'
  | 'school'
  | 'launch'

export interface WidgetMeta {
  id: WidgetId
  label: string
  enabled: boolean
}

export type TaskCategory = 'School' | 'Aviation' | 'Personal' | 'Maintenance'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface Task {
  id: string
  title: string
  category: TaskCategory
  priority: TaskPriority
  dueDate?: string // ISO date
  done: boolean
  createdAt: string
}

export interface CalendarEvent {
  id: string
  title: string
  date: string // ISO date (yyyy-mm-dd)
  time?: string // HH:MM
  location?: string
  type: 'flight' | 'class' | 'exam' | 'personal'
}

export interface ClassEntry {
  id: string
  name: string
  days: string[] // ['Mon','Wed','Fri']
  time: string
  room?: string
}

export interface Assignment {
  id: string
  title: string
  course: string
  dueDate: string
  done: boolean
}

export interface Certificate {
  id: string
  name: string
  progressHours: number
  goalHours: number
  complete: boolean
}

export interface FlightProgress {
  totalHours: number
  certificates: Certificate[]
  currency: {
    lastFlightDate?: string
    lastNightLandingDate?: string
    biennialReviewDate?: string
  }
  goals: string[]
}

export interface QuickLink {
  id: string
  label: string
  url: string
  icon?: string
}

export interface UserSettings {
  name: string
  favoriteAirport: string // ICAO code
  homeLat: number
  homeLon: number
  homeLabel: string
  theme: 'light' | 'dark' | 'system'
  accent: string
  widgets: WidgetMeta[]
  layoutOrder: WidgetId[]
}
