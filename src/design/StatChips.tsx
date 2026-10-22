import { useEffect, useState } from 'react'
import { useApp } from '@/store/useApp'
import { HEARTS_MAX, msToNextHeart, formatCountdown } from '@/domain/rules'
import { now } from '@/domain/clock'
import { BoltIcon, FlameIcon, GemIcon, HeartIcon } from '@/assets/icons'
import { dayKey } from '@/domain/clock'
import { AnimatedNumber } from './AnimatedNumber'

const base = 'inline-flex items-center gap-1 rounded-full px-1.5 py-1 font-display text-[16px] font-extrabold'

export function HeartChip({ onClick }: { onClick?: () => void }) {
  const hearts = useApp((s) => s.hearts)
  const anchor = useApp((s) => s.heartsAnchor)
  const [, tick] = useState(0)
  useEffect(() => { const i = setInterval(() => tick((n) => n + 1), 1000); return () => clearInterval(i) }, [])
  const ms = msToNextHeart({ hearts, heartsAnchor: anchor }, now())
  return (
    <button type="button" onClick={onClick} className={`${base} text-go-heart`} aria-label={`${hearts} corazones`}>
      <HeartIcon size={26} broken={hearts === 0} />
      <span className={hearts === 0 ? 'text-go-muted' : ''}>{hearts}</span>
      {hearts < HEARTS_MAX && <span className="text-[11px] font-bold text-go-muted">{formatCountdown(ms)}</span>}
    </button>
  )
}
export function StreakChip({ onClick }: { onClick?: () => void }) {
  const streak = useApp((s) => s.streak)
  const done = streak.lastDay === dayKey()
  return (
    <button type="button" onClick={onClick} className={`${base} ${done ? 'text-go-streak-text' : 'text-go-muted'}`} aria-label={`Racha de ${streak.count} días`}>
      {/* Racha hecha hoy: la llama "vive" (titila) y tiene un halo cálido. */}
      <span className={`relative grid place-items-center ${done ? 'origin-bottom animate-[flicker_1.6s_ease-in-out_infinite]' : ''}`}>
        {done && <span aria-hidden className="absolute inset-0 rounded-full bg-go-streak/40 blur-md" />}
        <FlameIcon size={26} off={!done} className="relative" />
      </span>
      <AnimatedNumber value={streak.count} />
    </button>
  )
}
export function GemChip({ onClick }: { onClick?: () => void }) {
  const gems = useApp((s) => s.gems)
  return (
    <button type="button" onClick={onClick} className={`${base} text-go-gem`} aria-label={`${gems} gemas`}>
      <GemIcon size={24} /><AnimatedNumber value={gems} />
    </button>
  )
}
export function XpChip({ value }: { value: number }) {
  return (<span className={`${base} text-go-xp-dark`}><BoltIcon size={24} /><AnimatedNumber value={value} /></span>)
}
