import { Crown, Gem, Medal, Star } from 'lucide-react'
import { SHIELD_INNER, SHIELD_PATH } from '@/assets/ShieldMark'
import { LEAGUE_TIERS } from '@/data/bots'

const GLYPH = { medal: Medal, star: Star, crown: Crown, gem: Gem }

/** Insignia de liga: escudo con el color del tier y un glifo al centro. */
export function TierShield({ tier, size = 64, locked, className = '' }: { tier: number; size?: number; locked?: boolean; className?: string }) {
  const t = LEAGUE_TIERS[Math.max(0, Math.min(LEAGUE_TIERS.length - 1, tier))]
  const Glyph = GLYPH[t.icon]
  const color = locked ? '#D8CFCC' : t.color
  const dark = locked ? '#B5ABA6' : t.dark
  return (
    <div className={`relative shrink-0 ${className}`} style={{ width: size, height: size * 1.2 }} role="img" aria-label={`Liga ${t.name}`}>
      <svg width={size} height={size * 1.2} viewBox="0 0 100 120" aria-hidden>
        <path d={SHIELD_PATH} fill={dark} />
        <path d={SHIELD_INNER} fill={color} />
        <path d="M50 9 L87 23 C87 40 84 54 79 66 C66 58 34 58 21 66 C16 54 13 40 13 23 Z" fill="#fff" opacity=".22" />
      </svg>
      <div className="absolute inset-0 grid place-items-center" style={{ paddingBottom: size * 0.1 }}>
        <Glyph size={size * 0.44} color="#fff" fill={t.icon === 'star' || t.icon === 'crown' ? '#fff' : 'none'} strokeWidth={2.4} style={{ filter: `drop-shadow(0 2px 0 ${dark})` }} />
      </div>
    </div>
  )
}
