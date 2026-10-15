import { AnimatePresence, motion } from 'framer-motion'
import type { ReactNode } from 'react'

/** Bottom sheet / modal centrado. */
export function Modal({ open, onClose, children, sheet = true }: { open: boolean; onClose?: () => void; children: ReactNode; sheet?: boolean }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-[430px] bg-white p-5 ${sheet ? 'rounded-t-[24px]' : 'm-4 rounded-[24px]'}`} style={{ paddingBottom: 'calc(20px + var(--safe-bottom))' }}
            initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }} transition={{ type: 'spring', damping: 24, stiffness: 300 }}>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
