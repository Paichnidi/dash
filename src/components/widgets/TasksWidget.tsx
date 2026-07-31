import { useState } from 'react'
import { WidgetCard } from '../WidgetCard'
import { ExpandedModal } from '../ExpandedModal'
import { useTasks } from '../../lib/data'
import { uid } from '../../lib/storage'
import { Check, Plus, Trash2 } from 'lucide-react'
import type { Task, TaskCategory, TaskPriority } from '../../types'

const CATEGORIES: TaskCategory[] = ['School', 'Aviation', 'Personal', 'Maintenance']
const PRIORITY_DOT: Record<TaskPriority, string> = {
  high: 'var(--color-ifr)',
  medium: 'var(--color-caution)',
  low: 'var(--color-muted)',
}

function TaskRow({ task, onToggle, onDelete }: { task: Task; onToggle: () => void; onDelete: () => void }) {
  return (
    <div className="flex items-center gap-3 py-2 group">
      <button
        onClick={onToggle}
        className={`shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
          task.done ? 'bg-[var(--color-accent)] border-[var(--color-accent)]' : 'border-hairline dark:border-hairline-dark'
        }`}
      >
        {task.done && <Check size={12} className="text-white" />}
      </button>
      <div className="flex-1 min-w-0">
        <div className={`text-sm truncate ${task.done ? 'line-through text-muted dark:text-muted-dark' : ''}`}>
          {task.title}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: PRIORITY_DOT[task.priority] }} />
          <span className="text-[11px] text-muted dark:text-muted-dark">{task.category}</span>
          {task.dueDate && <span className="text-[11px] text-muted dark:text-muted-dark">· {task.dueDate}</span>}
        </div>
      </div>
      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted dark:text-muted-dark p-1"
      >
        <Trash2 size={13} />
      </button>
    </div>
  )
}

export function TasksWidget({ dragHandleProps, isDragging }: { dragHandleProps?: any; isDragging?: boolean }) {
  const [tasks, setTasks] = useTasks()
  const [open, setOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState<TaskCategory>('Personal')

  const remaining = tasks.filter((t) => !t.done)
  const preview = remaining.slice(0, 3)

  const toggle = (id: string) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
  const remove = (id: string) => setTasks((prev) => prev.filter((t) => t.id !== id))
  const add = () => {
    if (!newTitle.trim()) return
    setTasks((prev) => [
      { id: uid(), title: newTitle.trim(), category: newCategory, priority: 'medium', done: false, createdAt: new Date().toISOString() },
      ...prev,
    ])
    setNewTitle('')
  }

  return (
    <>
      <WidgetCard id="tasks" label="Tasks" tag={`${remaining.length} Remaining`} onExpand={() => setOpen(true)} dragHandleProps={dragHandleProps} isDragging={isDragging}>
        {tasks.length === 0 && <div className="text-sm text-muted dark:text-muted-dark py-2">All clear</div>}
        <div className="space-y-1.5">
          {preview.map((t) => (
            <div key={t.id} className="flex items-center gap-2 text-sm">
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: PRIORITY_DOT[t.priority] }} />
              <span className="truncate">{t.title}</span>
            </div>
          ))}
        </div>
      </WidgetCard>

      <ExpandedModal open={open} onClose={() => setOpen(false)} title="Tasks" tag={`${remaining.length} remaining`}>
        <div className="flex gap-2 mb-4">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && add()}
            placeholder="Add a task"
            className="flex-1 rounded-lg border border-hairline dark:border-hairline-dark bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
          />
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value as TaskCategory)}
            className="rounded-lg border border-hairline dark:border-hairline-dark bg-transparent px-2 text-sm outline-none"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <button
            onClick={add}
            className="rounded-lg px-3 flex items-center justify-center text-white shrink-0"
            style={{ background: 'var(--color-accent)' }}
          >
            <Plus size={16} />
          </button>
        </div>

        <div className="divide-y divide-hairline dark:divide-hairline-dark">
          {tasks
            .slice()
            .sort((a, b) => Number(a.done) - Number(b.done))
            .map((t) => (
              <TaskRow key={t.id} task={t} onToggle={() => toggle(t.id)} onDelete={() => remove(t.id)} />
            ))}
        </div>
        {tasks.length === 0 && <div className="text-sm text-muted dark:text-muted-dark text-center py-6">No tasks yet</div>}
      </ExpandedModal>
    </>
  )
}
