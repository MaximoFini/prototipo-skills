import { ACHIEVEMENTS } from '@/data/achievements'
import { Link } from 'react-router-dom'
import { BarChart3, ChevronRight, Gift, Languages, Palmtree, Settings, ShoppingBag, Users } from 'lucide-react'
import { Avatar, FlameIcon, BoltIcon, ShieldMark, TrophyIcon } from '@/design'
import { useApp } from '@/store/useApp'

const LEAGUES = ['Bronce', 'Plata', 'Oro', 'Zafiro', 'Rubí']
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

const LINKS = [
  { to: '/profile/stats', label: 'Estadísticas', Icon: BarChart3 },
  { to: '/profile/friends', label: 'Amigos', Icon: Users },
  { to: '/profile/rewards', label: 'Mis premios', Icon: Gift },
  { to: '/practice/vocabulary', label: 'Práctica de vocabulario', Icon: Languages },
  { to: '/vacation', label: 'Desafío de Vacaciones', Icon: Palmtree },
  { to: '/shop', label: 'Tienda', Icon: ShoppingBag },
  { to: '/settings', label: 'Configuración', Icon: Settings },
]

export default function ProfilePage() {
  const profile = useApp((s) => s.profile)
  const streak = useApp((s) => s.streak)
  const xp = useApp((s) => s.xp)
  const league = useApp((s) => s.league)
  const achievements = useApp((s) => s.achievements)
  const since = new Date(profile.createdAt)
  const unlocked = Object.entries(achievements).filter(([id, a]) => ACHIEVEMENTS.some((d) => d.id === id) && a.level > 0).sort((a, b) => (b[1].unlockedAt ?? 0) - (a[1].unlockedAt ?? 0))
  const leagueName = LEAGUES[league.tier] ?? LEAGUES[0]

  const stats = [
    { label: 'Racha', value: streak.count, icon: <FlameIcon size={26} off={streak.count === 0} /> },
    { label: 'XP total', value: xp, icon: <BoltIcon size={26} /> },
    { label: 'Liga', value: leagueName, icon: <TrophyIcon size={26} /> },
    { label: 'Logros', value: unlocked.length, icon: <TrophyIcon size={26} /> },
  ]

  return (
    <div className="scroll-y h-full">
      <header className="bg-go-primary px-4 pb-12 text-center text-white" style={{ paddingTop: 'calc(24px + var(--safe-top))' }}>
        <div className="mx-auto w-fit rounded-full bg-white p-1"><Avatar id={profile.avatar} name={profile.name} size={88} /></div>
        <h1 className="mt-3 font-display text-[28px] font-extrabold leading-tight">{profile.name || 'Alumno'}</h1>
        <p className="text-[14px] text-white/90">En Skills desde {MESES[since.getMonth()]} {since.getFullYear()} · {profile.commission}</p>
      </header>

      <div className="space-y-5 px-4 py-4">
        <section aria-label="Resumen" className="-mt-10 grid grid-cols-4 gap-2">
          {stats.map((s) => (
            <div key={s.label} className="card-go flex flex-col items-center gap-0.5 bg-white px-1 py-3 text-center shadow-sm">
              {s.icon}
              <span className="font-display text-[17px] font-extrabold leading-tight text-go-text">{s.value}</span>
              <span className="text-[11px] font-bold uppercase tracking-wide text-go-muted">{s.label}</span>
            </div>
          ))}
        </section>

        <section aria-label="Logros">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-display text-[18px] font-extrabold text-go-text">Logros</h2>
            <Link to="/profile/achievements" className="font-display text-[13px] font-extrabold uppercase tracking-wide text-go-primary">Ver todos</Link>
          </div>
          <div className="card-go flex gap-3 p-3">
            {unlocked.length === 0 ? (
              <p className="py-2 text-[14px] text-go-muted">Todavía no desbloqueaste logros. ¡Completá tu primera lección!</p>
            ) : (
              unlocked.slice(0, 3).map(([id, a]) => (
                <div key={id} className="flex flex-1 flex-col items-center gap-1 text-center">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-go-xp/30"><TrophyIcon size={28} /></span>
                  <span className="text-[11px] font-bold text-go-muted">{ACHIEVEMENTS.find((d) => d.id === id)?.title ?? id} · {['', 'Bronce', 'Plata', 'Oro'][a.level]}</span>
                </div>
              ))
            )}
          </div>
        </section>

        <nav aria-label="Accesos" className="card-go divide-y-2 divide-go-border overflow-hidden">
          {LINKS.map(({ to, label, Icon }) => (
            <Link key={to} to={to} className="flex min-h-[52px] items-center gap-3 px-4 py-3 active:bg-go-surface">
              <Icon size={22} className="text-go-primary" strokeWidth={2.5} />
              <span className="flex-1 font-display text-[16px] font-bold text-go-text">{label}</span>
              <ChevronRight size={20} className="text-go-muted" />
            </Link>
          ))}
        </nav>

        <div className="flex items-center justify-center gap-3 rounded-go bg-go-primary-tint px-4 py-4 text-center">
          <ShieldMark size={32} />
          <p className="font-display text-[14px] font-extrabold text-go-primary">+25 años<br /><span className="font-sans text-[13px] font-medium text-go-text">Más de 25 años construyendo skills</span></p>
        </div>
      </div>
    </div>
  )
}
