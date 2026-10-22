import { motion, useReducedMotion } from 'framer-motion'
import { CheckIcon, FlameIcon } from '@/design'
import { useApp } from '@/store/useApp'
import { addDays, today, weekStart } from '@/domain/clock'

const DAY_LETTERS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

/** Desplegable de racha (como el de Duolingo): número grande + semana actual día por día. */
export function StreakWeek({ onMore }: { onMore: () => void }) {
  const reduce = useReducedMotion()
  const streak = useApp((s) => s.streak)
  const t = today()
  const done = streak.lastDay === t
  const start = weekStart(t)
  const week = Array.from({ length: 7 }, (_, i) => addDays(start, i))
  const active = new Set(streak.days)
  const frozen = new Set(streak.frozenDays)

  return (
    <motion.div role="dialog" aria-label="Tu racha"
      initial={reduce ? false : { y: -12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }}
      transition={{ type: 'spring', damping: 24, stiffness: 320 }}
      className="absolute inset-x-0 top-full z-30 border-b-2 border-go-border bg-white px-4 pb-4 pt-3 shadow-lg">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <p className={`font-display text-[40px] font-extrabold leading-none ${done ? 'text-go-streak-text' : 'text-go-muted'}`}>{streak.count}</p>
          <p className="font-display text-[16px] font-extrabold text-go-text">{streak.count === 1 ? 'día de racha' : 'días de racha'}</p>
          <p className="mt-0.5 text-[13px] text-go-muted">{done ? '¡Ya practicaste hoy! Volvé mañana.' : 'Hacé una lección hoy para no perderla.'}</p>
        </div>
        <div className={done ? 'origin-bottom animate-[flicker_1.6s_ease-in-out_infinite]' : ''}><FlameIcon size={64} off={!done} /></div>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1 rounded-go border-2 border-go-border p-2">
        {week.map((d, i) => {
          const on = active.has(d)
          const ice = frozen.has(d)
          const isToday = d === t
          return (
            <div key={d} className="flex flex-col items-center gap-1">
              <span className={`text-[12px] font-bold ${isToday ? 'text-go-streak-text' : 'text-go-muted'}`}>{DAY_LETTERS[i]}</span>
              <motion.span initial={reduce || !on ? false : { scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.05 * i, type: 'spring', stiffness: 400, damping: 16 }}
                className={`grid h-8 w-8 place-items-center rounded-full ${on ? 'bg-go-streak text-white' : ice ? 'bg-[#BFE3F7]' : isToday ? 'border-2 border-dashed border-go-streak' : 'bg-go-surface'}`}>
                {on && <CheckIcon size={16} />}
              </motion.span>
            </div>
          )
        })}
      </div>

      <div className="mt-3 flex items-center justify-between text-[13px]">
        <span className="text-go-muted">Mejor racha: <b className="text-go-text">{Math.max(streak.best, streak.count)} días</b></span>
        <button type="button" onClick={onMore} className="font-display font-extrabold uppercase tracking-wide text-go-primary">Ver estadísticas</button>
      </div>
    </motion.div>
  )
}
