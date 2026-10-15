import { NavLink } from 'react-router-dom'
import { BookOpen, Shield, Target, User } from 'lucide-react'

const items = [
  { to: '/', label: 'Aprender', Icon: BookOpen, end: true },
  { to: '/league', label: 'Liga', Icon: Shield },
  { to: '/quests', label: 'Misiones', Icon: Target },
  { to: '/profile', label: 'Perfil', Icon: User },
]
export function BottomNav() {
  return (
    <nav className="grid shrink-0 grid-cols-4 border-t-2 border-go-border bg-white" style={{ paddingBottom: 'var(--safe-bottom)' }} aria-label="Navegación principal">
      {items.map(({ to, label, Icon, end }) => (
        <NavLink key={to} to={to} end={end} className={({ isActive }) => `flex flex-col items-center gap-0.5 py-2 text-[11px] font-bold uppercase tracking-wide ${isActive ? 'text-go-primary' : 'text-go-muted'}`}>
          {({ isActive }) => (
            <>
              <span className={`grid h-9 w-12 place-items-center rounded-xl ${isActive ? 'bg-go-primary-tint border-2 border-go-primary/30' : ''}`}><Icon size={24} strokeWidth={2.5} /></span>
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
