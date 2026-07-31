import { useState } from 'react'
import { WidgetCard } from '../WidgetCard'
import { ExpandedModal } from '../ExpandedModal'
import { useClasses, useAssignments } from '../../lib/data'
import { Check } from 'lucide-react'

const DAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function SchoolWidget({ dragHandleProps, isDragging }: { dragHandleProps?: any; isDragging?: boolean }) {
  const [classes] = useClasses()
  const [assignments, setAssignments] = useAssignments()
  const [open, setOpen] = useState(false)

  const todayAbbr = DAY_ABBR[new Date().getDay()]
  const nextClass = classes.find((c) => c.days.includes(todayAbbr))
  const pendingAssignments = assignments.filter((a) => !a.done)

  const toggleAssignment = (id: string) =>
    setAssignments((prev) => prev.map((a) => (a.id === id ? { ...a, done: !a.done } : a)))

  return (
    <>
      <WidgetCard id="school" label="School" tag="Next Class" onExpand={() => setOpen(true)} dragHandleProps={dragHandleProps} isDragging={isDragging}>
        {nextClass ? (
          <div>
            <div className="font-medium text-sm">{nextClass.name}</div>
            <div className="font-mono text-xs text-muted dark:text-muted-dark mt-1">
              {nextClass.time}{nextClass.room ? ` · Room ${nextClass.room}` : ''}
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted dark:text-muted-dark py-2">No classes today</div>
        )}
        {pendingAssignments.length > 0 && (
          <div className="mt-2.5 text-xs text-muted dark:text-muted-dark">
            {pendingAssignments.length} assignment{pendingAssignments.length !== 1 ? 's' : ''} pending
          </div>
        )}
      </WidgetCard>

      <ExpandedModal open={open} onClose={() => setOpen(false)} title="School" tag={`${classes.length} classes`}>
        <div className="mb-5">
          <div className="font-mono text-[10px] uppercase tracking-wider text-muted dark:text-muted-dark mb-2">Schedule</div>
          <div className="space-y-2">
            {classes.map((c) => (
              <div key={c.id} className="flex items-center justify-between text-sm py-1.5 border-b border-hairline dark:border-hairline-dark last:border-0">
                <div>
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs text-muted dark:text-muted-dark">{c.days.join(' · ')}{c.room ? ` · Room ${c.room}` : ''}</div>
                </div>
                <span className="font-mono text-xs text-muted dark:text-muted-dark">{c.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="font-mono text-[10px] uppercase tracking-wider text-muted dark:text-muted-dark mb-2">Assignments</div>
          <div className="space-y-1.5">
            {assignments.map((a) => (
              <div key={a.id} className="flex items-center gap-3 py-1.5">
                <button
                  onClick={() => toggleAssignment(a.id)}
                  className={`shrink-0 w-5 h-5 rounded-full border flex items-center justify-center ${
                    a.done ? 'bg-[var(--color-accent)] border-[var(--color-accent)]' : 'border-hairline dark:border-hairline-dark'
                  }`}
                >
                  {a.done && <Check size={12} className="text-white" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm truncate ${a.done ? 'line-through text-muted dark:text-muted-dark' : ''}`}>{a.title}</div>
                  <div className="text-[11px] text-muted dark:text-muted-dark">{a.course} · Due {a.dueDate}</div>
                </div>
              </div>
            ))}
          </div>
          {assignments.length === 0 && <div className="text-sm text-muted dark:text-muted-dark py-4 text-center">Nothing due</div>}
        </div>
      </ExpandedModal>
    </>
  )
}
