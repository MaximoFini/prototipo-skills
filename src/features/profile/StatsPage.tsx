import { BookOpen, Clock, Flame, Languages, Target } from 'lucide-react'
import type { ReactNode } from 'react'
import { ScreenHeader } from '@/design'
import { useApp } from '@/store/useApp'
import { addDays, today } from '@/domain/clock'

const DOW = ['D', 'L', 'M', 'M', 'J', 'V', 'S']

function fmtTime(sec: number) {
  if (sec < 60) return `${sec} s`
  const m = Math.round(sec / 60)
  if (m < 60) return `${m} min`
  return `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')} min`
}

export default function StatsPage() {
  const xpByDay = useApp((s) => s.xpByDay)
  const stats = useApp((s) => s.stats)
  const vocab = useApp((s) => s.vocabulary.length)
  const best = useApp((s) => s.streak.best)
  const goal = useApp((s) => s.settings.dailyGoal)

  const t = today()
  const days = Array.from({ length: 7 }, (_, i) => {
    const key = addDays(t, i - 6)
    const [y, m, d] = key.split('-').map(Number)
    return { key, xp: xpByDay[key] ?? 0, dow: DOW[new Date(y, m - 1, d).getDay()], isToday: key === t }
  })
  const total = days.reduce((a, d) => a + d.xp, 0)
  const max = Math.max(goal, ...days.map((d) => d.xp), 1)
  const accuracy = stats.total ? Math.round((stats.correct / stats.total) * 100) : null

  const W = 320, H = 150, base = 120, bw = 28, gap = (W - bw * 7) / 8
  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="Estadísticas" back="/profile" />
      <div className="scroll-y flex-1 space-y-4 px-4 py-4">
        <section className="card-go p-4" aria-label="XP de los últimos 7 días">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-[18px] font-extrabold text-go-text">XP de la semana</h2>
            <span className="font-display text-[15px] font-extrabold text-go-xp-dark">{total} XP</span>
          </div>
          <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 w-full" role="img" aria-label={`XP por día: ${days.map((d) => `${d.dow} ${d.xp}`).join(', ')}`}>
            <line x1="0" x2={W} y1={base} y2={base} stroke="#E4DDD9" strokeWidth="2" />
            {days.map((d, i) => {
              const h = d.xp > 0 ? Math.max(6, (d.xp / max) * 92) : 3
              const x = gap + i * (bw + gap)
              return (
                <g key={d.key}>
                  <rect x={x} y={base - h} width={bw} height={h} rx="7" fill={d.isToday ? '#00522E' : d.xp > 0 ? '#F2C94C' : '#E4DDD9'} />
                  {d.xp > 0 && <text x={x + bw / 2} y={base - h - 5} textAnchor="middle" fontSize="11" fontWeight="700" fill="#1B1B1B">{d.xp}</text>}
                  <text x={x + bw / 2} y={base + 18} textAnchor="middle" fontSize="12" fontWeight={d.isToday ? 800 : 500} fill={d.isToday ? '#00522E' : '#6B6360'}>{d.isToday ? 'Hoy' : d.dow}</text>
                </g>
              )
            })}
          </svg>
        </section>

        <div className="grid grid-cols-2 gap-3">
          <Card icon={<BookOpen size={22} />} label="Lecciones completadas" value={stats.lessonsCompleted} />
          <Card icon={<Languages size={22} />} label="Palabras aprendidas" value={vocab} />
          <Card icon={<Target size={22} />} label="Precisión global" value={accuracy === null ? '—' : `${accuracy}%`} />
          <Card icon={<Clock size={22} />} label="Tiempo practicado" value={fmtTime(stats.seconds)} />
          <Card icon={<Flame size={22} />} label="Mejor racha" value={`${best} ${best === 1 ? 'día' : 'días'}`} />
        </div>
      </div>
    </div>
  )
}

function Card({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) {
  return (
    <div className="card-go p-3">
      <span className="text-go-primary">{icon}</span>
      <p className="mt-1 font-display text-[24px] font-extrabold leading-tight text-go-text">{value}</p>
      <p className="text-[13px] font-medium text-go-muted">{label}</p>
    </div>
  )
}
