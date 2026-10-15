import { MessageCircle, Percent, Shirt, Ticket } from 'lucide-react'
import type { Reward } from '@/data/rewards'

const MAP = { message: MessageCircle, percent: Percent, shirt: Shirt, ticket: Ticket }

export function RewardIcon({ icon, size = 26, tone = 'green' }: { icon: Reward['icon']; size?: number; tone?: 'green' | 'gold' | 'gray' }) {
  const Cmp = MAP[icon]
  const cls = tone === 'green' ? 'bg-go-primary-tint text-go-primary' : tone === 'gold' ? 'bg-go-xp text-go-text' : 'bg-go-surface text-go-muted'
  return (
    <span className={`grid shrink-0 place-items-center rounded-2xl ${cls}`} style={{ width: size * 1.8, height: size * 1.8 }} aria-hidden>
      <Cmp size={size} strokeWidth={2.4} />
    </span>
  )
}
