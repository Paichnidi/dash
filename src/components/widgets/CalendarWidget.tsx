import { useState } from 'react'
import { WidgetCard } from '../WidgetCard'
import { ExpandedModal } from '../ExpandedModal'
import { useEvents } from '../../lib/data'
import { uid } from '../../lib/storage'
import { Plus, Trash2, Plane, GraduationCap, FileWarning, User } from 'lucide-react'
import type { CalendarEvent } from '../../types'

const TYPE_ICON: Record<CalendarEvent['type'], any> = {
  flight: Plane,
  class: GraduationCap,
  exam: FileWarning,
  personal: User,
}

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export function CalendarWidget({ dragHandleProps, isDragging }: { dragHandleProps?: any; isDragging?: boolean }) {
  const [events, setEvents] = useEvents()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ title: '', date: todayISO(), time: '', type: 'personal' as CalendarEvent['type'] })

  const today = todayISO()
  const todays = events.filter((e) => e.date === today).sort((a, b) => (a.time ?? '').localeCompare(b.time ?? ''))
  const upcoming = events
    .filter((e) => e.date >= today)
    .sort((a, b) => (a.date + (a.time ?? '')).localeCompare(b.date + (b.time ?? '')))
    .slice(0, 8)

  const add = () => {
    if (!form.title.trim()) return
    setEvents((prev) => [...prev, { id: uid(), title: form.title.trim(), date: form.date, time: form.time || undefined, type: form.type }])
    setForm({ title: '', date: todayISO(), time: '', type: 'personal' })
  }
  const remove = (id: string) => setEvents((prev) => prev.filter((e) => e.id !== id))

  return (
    <>
      <WidgetCard id="calendar" label="Calendar" tag="Today" onExpand={() => setOpen(true)} dragHandleProps={dragHandleProps} isDragging={isDragging}>
        {todays.length === 0 && <div className="text-sm text-muted dark:text-muted-dark py-2">Nothing scheduled</div>}
        <div className="space-y-1.5">
          {todays.slice(0, 3).map((e) => (
            <div key={e.id} className="flex items-center gap-2 text-sm">
              <span className="font-mono text-xs text-muted dark:text-muted-dark w-12 shrink-0">{e.time ?? 'All day'}</span>
              <span className="truncate">{e.title}</span>
            </div>
          ))}
        </div>
      </WidgetCard>

      <ExpandedModal open={open} onClose={() => setOpen(false)} title="Calendar" tag="Upcoming">
        <div className="space-y-2 mb-4">
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Event title"
            className="w-full rounded-lg border border-hairline dark:border-hairline-dark bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
          />
          <div className="flex gap-2">
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              className="flex-1 rounded-lg border border-hairline dark:border-hairline-dark bg-transparent px-2 py-2 text-sm outline-none"
            />
            <input
              type="time"
              value={form.time}
              onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
              className="flex-1 rounded-lg border border-hairline dark:border-hairline-dark bg-transparent px-2 py-2 text-sm outline-none"
            />
            <select
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as CalendarEvent['type'] }))}
              className="rounded-lg border border-hairline dark:border-hairline-dark bg-transparent px-2 text-sm outline-none"
            >
              <option value="flight">Flight</option>
              <option value="class">Class</option>
              <option value="exam">Exam</option>
              <option value="personal">Personal</option>
            </select>
            <button onClick={add} className="rounded-lg px-3 flex items-center justify-center text-white shrink-0" style={{ background: 'var(--color-accent)' }}>
              <Plus size={16} />
            </button>
          </div>
        </div>

        <div className="divide-y divide-hairline dark:divide-hairline-dark">
          {upcoming.map((e) => {
            const Icon = TYPE_ICON[e.type]
            return (
              <div key={e.id} className="flex items-center gap-3 py-2.5 group">
                <Icon size={15} className="text-muted dark:text-muted-dark shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate">{e.title}</div>
                  <div className="text-[11px] text-muted dark:text-muted-dark">
                    {e.date === today ? 'Today' : e.date}{e.time ? ` · ${e.time}` : ''}{e.location ? ` · ${e.location}` : ''}
                  </div>
                </div>
                <button onClick={() => remove(e.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted dark:text-muted-dark p-1">
                  <Trash2 size={13} />
                </button>
              </div>
            )
          })}
        </div>
        {upcoming.length === 0 && <div className="text-sm text-muted dark:text-muted-dark text-center py-6">No upcoming events</div>}
      </ExpandedModal>
    </>
  )
}
