import type { ReactNode } from 'react'
import { BookOpen, Clock, Flag, Moon, Sun, Target } from 'lucide-react'
import { BoltIcon, ChestIcon, CheckIcon, FlameIcon, GemIcon, LockIcon, ProgressBar, ScreenHeader, Skilly, StarIcon, TrophyIcon } from '@/design'
import { ACHIEVEMENTS, MEDALS, type AchievementDef, type AchievementIcon } from '@/data/achievements'
import { useApp } from '@/store/useApp'
import type { UserState } from '@/domain/types'
import { metricValue, nextProgress } from './achievements'

const MEDAL_STYLE = [
  { bg: '#D8CFCC', ring: '#B5ABA6', text: '#6B6360' },
  { bg: '#E0A070', ring: '#B06A35', text: '#6E3B14' }, // bronce
  { bg: '#E3E6EA', ring: '#9AA3AD', text: '#4A525B' }, // plata
  { bg: '#F2C94C', ring: '#C9A02C', text: '#5A4408' }, // oro
]

function GlyphIcon({ icon, size }: { icon: AchievementIcon; size: number }): ReactNode {
  const lp = { size, strokeWidth: 2.6 }
  switch (icon) {
    case 'flame': return <FlameIcon size={size} />
    case 'bolt': return <BoltIcon size={size} />
    case 'star': return <StarIcon size={size} style={{ color: '#F2C94C' }} />
    case 'trophy': return <TrophyIcon size={size} />
    case 'gem': return <GemIcon size={size} />
    case 'check': return <CheckIcon size={size} style={{ color: '#00522E' }} />
    case 'chest': return <ChestIcon size={size} />
    case 'book': return <BookOpen {...lp} color="#00522E" />
    case 'sun': return <Sun {...lp} color="#C77412" />
    case 'moon': return <Moon {...lp} color="#1F5FA8" />
    case 'target': return <Target {...lp} color="#B8252B" />
    case 'clock': return <Clock {...lp} color="#00522E" />
    case 'flag': return <Flag {...lp} color="#B8252B" />
  }
}

function Badge({ icon, level }: { icon: AchievementIcon; level: number }) {
  const m = MEDAL_STYLE[level]
  return (
    <div className="relative grid h-[64px] w-[64px] shrink-0 place-items-center rounded-full border-4" style={{ background: m.bg, borderColor: m.ring }}>
      {level === 0 ? <LockIcon size={26} style={{ color: '#6B6360' }} /> : <GlyphIcon icon={icon} size={32} />}
    </div>
  )
}

function Row({ def, s }: { def: AchievementDef; s: UserState }) {
  const level = s.achievements[def.id]?.level ?? 0
  const value = metricValue(def.metric, s)
  const p = nextProgress(def, value, level)
  const locked = level === 0
  const maxed = level >= 3
  const m = MEDAL_STYLE[level]
  const next = def.tiers[Math.min(level, 2)]
  return (
    <li className={`card-go flex items-center gap-3 p-3 ${locked ? 'bg-go-surface' : ''}`}>
      <Badge icon={def.icon} level={level} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className={`truncate font-display text-[16px] font-extrabold ${locked ? 'text-go-muted' : ''}`}>{def.title}</p>
          <span className="shrink-0 rounded-full px-2 py-0.5 font-display text-[11px] font-extrabold uppercase tracking-wide" style={{ background: m.bg, color: m.text }}>
            {locked ? 'Bloqueado' : MEDALS[level]}
          </span>
        </div>
        <p className="text-[13px] leading-snug text-go-muted">{def.description.replace('{n}', String(next))}</p>
        <div className="mt-1.5 flex items-center gap-2">
          <ProgressBar value={p.pct} height={10} color={maxed ? '#C9A02C' : '#00522E'} />
          <span className="w-[62px] shrink-0 text-right text-[12px] font-bold text-go-muted">{maxed ? 'Al máximo' : `${p.value}/${p.target}`}</span>
        </div>
      </div>
    </li>
  )
}

export default function AchievementsPage() {
  const s = useApp((st) => st)
  const unlocked = ACHIEVEMENTS.filter((d) => (s.achievements[d.id]?.level ?? 0) > 0).length
  const medals = ACHIEVEMENTS.reduce((a, d) => a + (s.achievements[d.id]?.level ?? 0), 0)
  return (
    <div className="flex h-full flex-col bg-white">
      <ScreenHeader title="Logros" />
      <div className="scroll-y flex-1 px-4 pb-8 pt-4">
        <div className="mb-4 flex items-center gap-3 rounded-[20px] bg-go-primary p-4 text-white">
          <Skilly mood={unlocked ? 'cheer' : 'wink'} size={64} />
          <div>
            <p className="font-display text-[22px] font-extrabold leading-tight">{unlocked}/{ACHIEVEMENTS.length} logros</p>
            <p className="text-[14px] opacity-90">{unlocked ? `${medals} medallas en total. ¡A por las de oro!` : 'Todavía no destrabaste ninguno. Una lección y arrancás.'}</p>
          </div>
        </div>
        <ul className="flex flex-col gap-3">
          {ACHIEVEMENTS.map((d) => <Row key={d.id} def={d} s={s} />)}
        </ul>
      </div>
    </div>
  )
}
