import { useId, type ReactNode } from 'react'
import { BookOpen, Clock, Flag, Moon, Sun, Target } from 'lucide-react'
import { BoltIcon, ChestIcon, CheckIcon, FlameIcon, GemIcon, LockIcon, StarIcon, TrophyIcon } from '@/design'
import { SHIELD_PATH } from '@/assets/ShieldMark'
import type { AchievementIcon } from '@/data/achievements'

export function GlyphIcon({ icon, size }: { icon: AchievementIcon; size: number }): ReactNode {
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

/** [claro, oscuro, cinta] por nivel: bloqueado, bronce, plata, oro. */
const METAL: [string, string, string][] = [
  ['#EFE9E6', '#B5ABA6', '#CFC6C1'],
  ['#F2BE8A', '#A8622C', '#B8252B'],
  ['#F4F6F8', '#8C96A0', '#00522E'],
  ['#FFE38A', '#C9A02C', '#B8252B'],
]

/**
 * Medalla de logro con forma de escudo Skills: metal con degradé, borde,
 * brillo diagonal y cintas. Bloqueada = escudo gris con candado.
 */
export function AchievementBadge({ icon, level, size = 64 }: { icon: AchievementIcon; level: number; size?: number }) {
  const id = useId().replace(/:/g, '')
  const [light, dark, ribbon] = METAL[Math.max(0, Math.min(3, level))]
  const locked = level === 0
  return (
    <div className="relative grid shrink-0 place-items-center" style={{ width: size, height: size * 1.15 }}>
      <svg width={size} height={size * 1.15} viewBox="0 0 100 120" className="absolute inset-0 overflow-visible" aria-hidden>
        <defs>
          <linearGradient id={`m${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={light} />
            <stop offset="1" stopColor={dark} />
          </linearGradient>
          <clipPath id={`c${id}`}><path d={SHIELD_PATH} /></clipPath>
        </defs>
        {!locked && (
          <>
            <path d="M22 96 L10 118 L24 113 L30 124 L38 102Z" fill={ribbon} opacity=".9" />
            <path d="M78 96 L90 118 L76 113 L70 124 L62 102Z" fill={ribbon} opacity=".9" />
          </>
        )}
        <path d={SHIELD_PATH} fill={dark} transform="translate(0 5)" />
        <path d={SHIELD_PATH} fill={`url(#m${id})`} stroke={dark} strokeWidth="3" />
        <path d="M50 16 L82 28 C82 62 73 86 50 100 C27 86 18 62 18 28 Z" fill="#fff" opacity={locked ? 0.5 : 0.85} />
        {!locked && (
          <g clipPath={`url(#c${id})`}>
            <rect x="-30" y="-20" width="26" height="170" fill="#fff" opacity=".35" transform="rotate(25)" />
          </g>
        )}
      </svg>
      <span className="relative -mt-2">{locked ? <LockIcon size={size * 0.36} style={{ color: '#6B6360' }} /> : <GlyphIcon icon={icon} size={size * 0.44} />}</span>
    </div>
  )
}
