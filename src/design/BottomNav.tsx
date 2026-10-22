import { NavLink } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { BookOpen, Shield, Target, User } from 'lucide-react'
import { sfx } from '@/lib/sfx'

export const NAV_ITEMS = [
  { to: '/', label: 'Aprender', Icon: BookOpen, end: true },
  { to: '/league', label: 'Liga', Icon: Shield },
  { to: '/quests', label: 'Misiones', Icon: Target },
  { to: '/profile', label: 'Perfil', Icon: User },
]
export function BottomNav() {
  const reduce = useReducedMotion()
  return (
    <nav className="grid shrink-0 grid-cols-4 border-t-2 border-go-border bg-white" style={{ paddingBottom: 'var(--safe-bottom)' }} aria-label="Navegación principal">
      {NAV_ITEMS.map(({ to, label, Icon, end }) => (
        <NavLink key={to} to={to} end={end} onClick={() => sfx.tap()} className={({ isActive }) => `flex flex-col items-center gap-0.5 py-2 text-[11px] font-bold uppercase tracking-wide transition-colors ${isActive ? 'text-go-primary' : 'text-go-muted'}`}>
          {({ isActive }) => (
            <>
              <span className="relative grid h-9 w-12 place-items-center">
                {/* La "pastilla" se desliza de una pestaña a otra. */}
                {isActive && (
                  <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-xl border-2 border-go-primary/30 bg-go-primary-tint"
                    transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 32 }} />
                )}
                <motion.span key={String(isActive)} className="relative"
                  initial={isActive && !reduce ? { scale: 0.7, y: 4 } : false} animate={{ scale: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 12 }}>
                  <Icon size={24} strokeWidth={2.5} />
                </motion.span>
              </span>
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
