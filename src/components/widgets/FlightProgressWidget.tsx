import { useState } from 'react'
import { WidgetCard } from '../WidgetCard'
import { ExpandedModal } from '../ExpandedModal'
import { useFlightProgress } from '../../lib/data'

function ProgressBar({ value, goal, complete }: { value: number; goal: number; complete: boolean }) {
  const pct = Math.min(100, Math.round((value / goal) * 100))
  return (
    <div className="h-1.5 rounded-full bg-black/[0.06] dark:bg-white/[0.08] overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700 ease-out"
        style={{ width: `${pct}%`, background: complete ? 'var(--color-vfr)' : 'var(--color-accent)' }}
      />
    </div>
  )
}

export function FlightProgressWidget({ dragHandleProps, isDragging }: { dragHandleProps?: any; isDragging?: boolean }) {
  const [progress, setProgress] = useFlightProgress()
  const [open, setOpen] = useState(false)
  const active = progress.certificates.find((c) => !c.complete) ?? progress.certificates[0]

  const updateHours = (id: string, hours: number) => {
    setProgress((p) => ({
      ...p,
      certificates: p.certificates.map((c) => (c.id === id ? { ...c, progressHours: hours, complete: hours >= c.goalHours } : c)),
    }))
  }
  const updateTotal = (hours: number) => setProgress((p) => ({ ...p, totalHours: hours }))

  return (
    <>
      <WidgetCard id="flight" label="Flight Progress" tag="Certificates" onExpand={() => setOpen(true)} dragHandleProps={dragHandleProps} isDragging={isDragging}>
        {active ? (
          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="font-medium text-sm">{active.name}</span>
              <span className="font-mono text-xs text-muted dark:text-muted-dark tabular-nums">
                {active.progressHours} / {active.goalHours} hrs
              </span>
            </div>
            <ProgressBar value={active.progressHours} goal={active.goalHours} complete={active.complete} />
            <div className="mt-3 text-xs text-muted dark:text-muted-dark">
              Total flight time: <span className="tabular-nums font-medium text-ink dark:text-ink-dark">{progress.totalHours} hrs</span>
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted dark:text-muted-dark py-2">No certificates tracked</div>
        )}
      </WidgetCard>

      <ExpandedModal open={open} onClose={() => setOpen(false)} title="Flight Progress" tag={`${progress.totalHours} total hours`}>
        <div className="space-y-5">
          <div>
            <label className="font-mono text-[10px] uppercase tracking-wider text-muted dark:text-muted-dark">Total flight time</label>
            <input
              type="number"
              step="0.1"
              value={progress.totalHours}
              onChange={(e) => updateTotal(Number(e.target.value))}
              className="w-full mt-1 rounded-lg border border-hairline dark:border-hairline-dark bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          <div className="space-y-4">
            {progress.certificates.map((c) => (
              <div key={c.id}>
                <div className="flex items-baseline justify-between mb-1.5">
                  <span className="font-medium text-sm flex items-center gap-1.5">
                    {c.name}
                    {c.complete && <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'var(--color-vfr)', color: 'white' }}>Complete</span>}
                  </span>
                  <span className="font-mono text-xs text-muted dark:text-muted-dark tabular-nums">
                    {c.progressHours} / {c.goalHours} hrs
                  </span>
                </div>
                <ProgressBar value={c.progressHours} goal={c.goalHours} complete={c.complete} />
                <input
                  type="range"
                  min={0}
                  max={c.goalHours}
                  step={0.5}
                  value={c.progressHours}
                  onChange={(e) => updateHours(c.id, Number(e.target.value))}
                  className="w-full mt-2 accent-[var(--color-accent)]"
                />
              </div>
            ))}
          </div>

          {progress.goals.length > 0 && (
            <div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-muted dark:text-muted-dark mb-2">Upcoming goals</div>
              <ul className="space-y-1.5">
                {progress.goals.map((g, i) => (
                  <li key={i} className="text-sm flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-accent)' }} />
                    {g}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </ExpandedModal>
    </>
  )
}
