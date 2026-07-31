import { useEffect, useState } from 'react'
import { WidgetCard } from '../WidgetCard'
import { useSettings } from '../../lib/settings'
import { useTasks, useEvents } from '../../lib/data'
import { Sparkles } from 'lucide-react'

function greeting(hour: number) {
  if (hour < 5) return 'Good Night'
  if (hour < 12) return 'Good Morning'
  if (hour < 17) return 'Good Afternoon'
  return 'Good Evening'
}

function minutesUntil(dateISO: string, time?: string) {
  const [h, m] = (time ?? '00:00').split(':').map(Number)
  const target = new Date(dateISO)
  target.setHours(h, m, 0, 0)
  return Math.round((target.getTime() - Date.now()) / 60000)
}

export function DailyOverviewWidget({ dragHandleProps, isDragging }: { dragHandleProps?: any; isDragging?: boolean }) {
  const { settings } = useSettings()
  const [tasks] = useTasks()
  const [events] = useEvents()
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(t)
  }, [])

  const todayISO = now.toISOString().slice(0, 10)
  const todaysEvents = events
    .filter((e) => e.date === todayISO)
    .sort((a, b) => (a.time ?? '').localeCompare(b.time ?? ''))
  const nextEvent = todaysEvents.find((e) => minutesUntil(e.date, e.time) >= -15)
  const remaining = tasks.filter((t) => !t.done).length

  const dateLabel = now.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
  const timeLabel = now.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })

  return (
    <WidgetCard id="daily" label="Today" tag="Overview" span="double" dragHandleProps={dragHandleProps} isDragging={isDragging}>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold leading-tight">
            {greeting(now.getHours())}, {settings.name}
          </h1>
          <p className="text-sm text-muted dark:text-muted-dark mt-1">
            {dateLabel} · {timeLabel}
          </p>
        </div>
        <Sparkles size={18} className="text-accent mt-1 shrink-0" style={{ color: 'var(--color-accent)' }} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-black/[0.03] dark:bg-white/[0.03] px-3.5 py-3">
          <div className="font-mono text-[10px] uppercase tracking-wider text-muted dark:text-muted-dark">Next up</div>
          {nextEvent ? (
            <>
              <div className="font-medium mt-0.5">{nextEvent.title}</div>
              <div className="text-sm text-muted dark:text-muted-dark">
                {minutesUntil(nextEvent.date, nextEvent.time) > 0
                  ? `in ${minutesUntil(nextEvent.date, nextEvent.time)} min`
                  : 'happening now'}
              </div>
            </>
          ) : (
            <div className="font-medium mt-0.5 text-muted dark:text-muted-dark">Nothing scheduled</div>
          )}
        </div>
        <div className="rounded-xl bg-black/[0.03] dark:bg-white/[0.03] px-3.5 py-3">
          <div className="font-mono text-[10px] uppercase tracking-wider text-muted dark:text-muted-dark">Tasks</div>
          <div className="font-medium mt-0.5">
            {remaining} remaining
          </div>
          <div className="text-sm text-muted dark:text-muted-dark">
            {tasks.length - remaining} completed today
          </div>
        </div>
      </div>
    </WidgetCard>
  )
}
