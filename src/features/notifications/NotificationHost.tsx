import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ShieldMark } from '@/design'
import { useApp } from '@/store/useApp'
import { sfx } from '@/lib/sfx'
import type { AppNotification } from '@/domain/types'

const ROUTES: Partial<Record<AppNotification['kind'], string>> = {
  'streak-risk': '/',
  league: '/league',
  vacation: '/vacation',
}
const AUTO_DISMISS_MS = 6000

/**
 * Overlay global (dentro del PhoneFrame): muestra de a una las notificaciones mock como banner
 * estilo sistema. Se descarta solo a los 6 s, al tocarlo o al deslizarlo hacia arriba.
 */
export function NotificationHost() {
  const list = useApp((s) => s.notifications)
  const dismiss = useApp((s) => s.dismissNotification)
  const nav = useNavigate()
  const current = list.length ? list[list.length - 1] : null
  const id = current?.id

  useEffect(() => {
    if (!id) return
    sfx.notify()
    const t = setTimeout(() => dismiss(id), AUTO_DISMISS_MS)
    return () => clearTimeout(t)
  }, [id, dismiss])

  const open = (n: AppNotification) => {
    dismiss(n.id)
    const to = ROUTES[n.kind]
    if (to) nav(to)
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-[60] px-2" style={{ paddingTop: 'calc(8px + var(--safe-top))' }} aria-live="polite">
      <AnimatePresence mode="wait">
        {current && (
          <motion.div key={current.id} className="pointer-events-auto"
            initial={{ y: -120, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -120, opacity: 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            drag="y" dragConstraints={{ top: 0, bottom: 0 }} dragElastic={0.4}
            onDragEnd={(_, i) => { if (i.offset.y < -30) dismiss(current.id) }}>
            <button type="button" onClick={() => open(current)} role="alert"
              className="flex w-full items-start gap-3 rounded-[22px] border border-black/10 bg-white/95 p-3 text-left shadow-[0_8px_30px_rgba(0,0,0,.25)] backdrop-blur">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] bg-go-primary">
                <ShieldMark size={22} mono="#FFFFFF" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wide text-go-muted">
                  <span>Skills Go</span><span>ahora</span>
                </span>
                <span className="block font-display text-[15px] font-extrabold leading-tight text-go-text">{current.title}</span>
                <span className="mt-0.5 line-clamp-2 block text-[13px] leading-snug text-go-text/80">{current.body}</span>
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
