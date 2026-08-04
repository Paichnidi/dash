/** import { useState } from 'react'
import { WidgetCard } from '../WidgetCard'
import { ExpandedModal } from '../ExpandedModal'
import { useQuickLinks } from '../../lib/data'
import { uid } from '../../lib/storage'
import { ExternalLink, Plus, Trash2 } from 'lucide-react'

export function QuickLaunchWidget({ dragHandleProps, isDragging }: { dragHandleProps?: any; isDragging?: boolean }) {
  const [links, setLinks] = useQuickLinks()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ label: '', url: '' })

  const add = () => {
    if (!form.label.trim() || !form.url.trim()) return
    const url = form.url.startsWith('http') ? form.url : `https://${form.url}`
    setLinks((prev) => [...prev, { id: uid(), label: form.label.trim(), url }])
    setForm({ label: '', url: '' })
  }
  const remove = (id: string) => setLinks((prev) => prev.filter((l) => l.id !== id))

  return (
    <>
      <WidgetCard id="launch" label="Quick Launch" span="double" onExpand={() => setOpen(true)} dragHandleProps={dragHandleProps} isDragging={isDragging}>
        <div className="grid grid-cols-4 gap-2">
          {links.slice(0, 4).map((l) => (
            <a
              key={l.id}
              href={l.url}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex flex-col items-center justify-center gap-1.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] py-3 hover:bg-black/[0.06] dark:hover:bg-white/[0.06] transition-colors"
            >
              <ExternalLink size={15} style={{ color: 'var(--color-accent)' }} />
              <span className="text-[11px] text-center leading-tight">{l.label}</span>
            </a>
          ))}
        </div>
      </WidgetCard>

      <ExpandedModal open={open} onClose={() => setOpen(false)} title="Quick Launch" tag={`${links.length} shortcuts`}>
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          {links.map((l) => (
            <div key={l.id} className="relative group">
              <a
                href={l.url}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center justify-center gap-2 rounded-xl bg-black/[0.03] dark:bg-white/[0.03] py-4 hover:bg-black/[0.06] dark:hover:bg-white/[0.06] transition-colors"
              >
                <ExternalLink size={18} style={{ color: 'var(--color-accent)' }} />
                <span className="text-xs text-center leading-tight px-1">{l.label}</span>
              </a>
              <button
                onClick={() => remove(l.id)}
                className="absolute -top-1.5 -right-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-surface dark:bg-surface-dark border border-hairline dark:border-hairline-dark rounded-full p-1"
              >
                <Trash2 size={11} className="text-muted dark:text-muted-dark" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            value={form.label}
            onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
            placeholder="Label"
            className="flex-1 rounded-lg border border-hairline dark:border-hairline-dark bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
          />
          <input
            value={form.url}
            onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
            placeholder="URL"
            className="flex-1 rounded-lg border border-hairline dark:border-hairline-dark bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
          />
          <button onClick={add} className="rounded-lg px-3 flex items-center justify-center text-white shrink-0" style={{ background: 'var(--color-accent)' }}>
            <Plus size={16} />
          </button>
        </div>
      </ExpandedModal>
    </>
  )
}
*/ 