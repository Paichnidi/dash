import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { GripVertical } from 'lucide-react'

interface WidgetCardProps {
  id: string
  label: string
  tag?: string
  span?: 'single' | 'double'
  onExpand?: () => void
  dragHandleProps?: any
  isDragging?: boolean
  children: ReactNode
}

export function WidgetCard({
  id,
  label,
  tag,
  span = 'single',
  onExpand,
  dragHandleProps,
  isDragging,
  children,
}: WidgetCardProps) {
  return (
    <motion.div
      layoutId={`widget-${id}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      whileTap={onExpand ? { scale: 0.985 } : undefined}
      className={`
        group relative rounded-2xl border
        border-hairline dark:border-hairline-dark
        bg-surface dark:bg-surface-dark
        ${span === 'double' ? 'col-span-2' : 'col-span-1'}
        ${isDragging ? 'opacity-50 shadow-xl ring-1 ring-accent/40' : 'shadow-[0_1px_2px_rgba(0,0,0,0.03)]'}
        transition-shadow hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)]
        overflow-hidden
      `}
      style={{ borderColor: undefined }}
    >
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted dark:text-muted-dark">
            {tag ?? label}
          </span>
        </div>
        <button
          {...dragHandleProps}
          className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing text-muted dark:text-muted-dark touch-none p-1 -m-1"
          aria-label="Reorder widget"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical size={14} />
        </button>
      </div>
      <button
        onClick={onExpand}
        className="w-full text-left px-4 pb-4 pt-1 cursor-pointer"
        disabled={!onExpand}
      >
        {children}
      </button>
    </motion.div>
  )
}
