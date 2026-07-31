import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'

interface ExpandedModalProps {
  open: boolean
  onClose: () => void
  title: string
  tag?: string
  children: ReactNode
}

export function ExpandedModal({ open, onClose, title, tag, children }: ExpandedModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full sm:max-w-lg max-h-[85vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-hairline dark:border-hairline-dark bg-surface dark:bg-surface-dark shadow-2xl"
          >
            <div className="sticky top-0 flex items-center justify-between px-5 py-4 bg-surface/90 dark:bg-surface-dark/90 backdrop-blur border-b border-hairline dark:border-hairline-dark">
              <div>
                {tag && (
                  <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted dark:text-muted-dark mb-0.5">
                    {tag}
                  </div>
                )}
                <h2 className="font-display font-semibold text-lg">{title}</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-muted dark:text-muted-dark"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-5 py-4">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
