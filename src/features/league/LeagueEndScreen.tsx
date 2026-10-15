import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button, Skilly } from '@/design'
import type { LeagueState } from '@/domain/types'
import { LEAGUE_TIERS } from '@/data/bots'
import { burst, celebrate } from '@/lib/confetti'
import { sfx } from '@/lib/sfx'
import { TierShield } from './TierShield'

type Result = NonNullable<LeagueState['lastResult']>

/** Pantalla de fin de semana de liga: ascenso, descenso o te quedaste. */
export function LeagueEndScreen({ result, onContinue }: { result: Result; onContinue: () => void }) {
  const { from, to, rank, outcome } = result
  const toName = LEAGUE_TIERS[to].name
  const fromName = LEAGUE_TIERS[from].name
  useEffect(() => {
    if (outcome === 'promoted') {
      sfx.finish()
      burst()
      celebrate()
    } else if (outcome === 'demoted') sfx.heartLost()
    else sfx.tap()
  }, [outcome])

  const title = outcome === 'promoted' ? `¡Subiste a ${toName}!` : outcome === 'demoted' ? `Bajaste a ${toName}` : `Te quedaste en ${toName}`
  const sub =
    outcome === 'promoted'
      ? `Terminaste en el puesto ${rank}. ¡Qué semanón!`
      : outcome === 'demoted'
        ? `Terminaste en el puesto ${rank}. No pasa nada, esta semana se remonta.`
        : from === 4 && rank <= 10
          ? `Puesto ${rank}: seguís en lo más alto. ¡Leyenda!`
          : `Terminaste en el puesto ${rank}. Un empujoncito más y subís.`
  const mood = outcome === 'promoted' ? 'cheer' : outcome === 'demoted' ? 'sad' : 'happy'

  return (
    <div className="flex h-full flex-col items-center bg-go-primary px-6 text-center text-white" style={{ paddingTop: 'calc(24px + var(--safe-top))', paddingBottom: 'calc(20px + var(--safe-bottom))' }}>
      <div className="inline-block bg-go-danger px-3 py-1 font-display text-[12px] font-extrabold uppercase tracking-[0.1em]">Fin de la semana de liga</div>
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <motion.div initial={{ scale: 0.4, rotate: -12, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} transition={{ type: 'spring', damping: 11, stiffness: 160 }} className="flex items-end gap-2">
          <Skilly mood={mood} size={96} />
          <TierShield tier={to} size={92} />
        </motion.div>
        <motion.h1 initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }} className="font-display text-[32px] font-extrabold leading-tight">{title}</motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="max-w-[300px] text-[16px] text-white/90">{sub}</motion.p>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex items-center gap-3 rounded-go bg-white/10 px-5 py-3">
          <div>
            <div className="text-[12px] font-bold uppercase tracking-wider text-white/70">Posición final</div>
            <div className="font-display text-[30px] font-extrabold leading-none">#{rank}</div>
          </div>
          <div className="h-10 w-px bg-white/25" />
          <div className="text-left">
            <div className="text-[12px] font-bold uppercase tracking-wider text-white/70">Liga</div>
            <div className="font-display text-[18px] font-extrabold leading-tight">{outcome === 'stayed' ? toName : `${fromName} → ${toName}`}</div>
          </div>
        </motion.div>
      </div>
      <Button variant="secondary" block onClick={onContinue} className="max-w-[360px]">Continuar</Button>
    </div>
  )
}

export default LeagueEndScreen
