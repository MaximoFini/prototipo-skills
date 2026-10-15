import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Timer } from 'lucide-react'
import type { LessonSummary } from '@/domain/types'
import { BoltIcon, Button, CheckIcon, GemIcon, Skilly } from '@/design'
import { celebrate } from '@/lib/confetti'
import { sfx } from '@/lib/sfx'
import { XP_FAST, XP_PERFECT } from '@/domain/rules'

/** Número que sube animado de 0 a `value`. */
function useCountUp(value: number, ms = 900, delay = 0) {
  const reduce = useReducedMotion()
  const [n, setN] = useState(reduce ? value : 0)
  useEffect(() => {
    if (reduce) { setN(value); return }
    let raf = 0
    const t0 = performance.now() + delay
    const step = (t: number) => {
      const p = Math.min(1, Math.max(0, (t - t0) / ms))
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [value, ms, delay, reduce])
  return n
}

export const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`

function StatCard({ label, tone, children, delay }: { label: string; tone: string; children: React.ReactNode; delay: number }) {
  const reduce = useReducedMotion()
  return (
    <motion.div className={`flex flex-1 flex-col overflow-hidden rounded-go border-2 ${tone}`}
      initial={reduce ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.3 }}>
      <div className="px-1 py-1 text-center font-display text-[11px] font-extrabold uppercase tracking-wider">{label}</div>
      <div className="flex flex-1 items-center justify-center gap-1 rounded-t-[10px] bg-white px-1 py-3 font-display text-[22px] font-extrabold text-go-text">{children}</div>
    </motion.div>
  )
}

export function LessonResultScreen({ summary, onContinue }: { summary: LessonSummary; onContinue: () => void }) {
  const xp = useCountUp(summary.xpGained, 900, 300)
  const acc = useCountUp(summary.accuracy, 900, 450)
  const gems = useCountUp(summary.gemsGained, 900, 600)

  useEffect(() => {
    sfx.finish()
    celebrate()
  }, [])

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="scroll-y flex flex-1 flex-col items-center px-4 pt-8">
        <motion.div className="animate-float" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', damping: 12 }}>
          <Skilly mood="cheer" size={130} />
        </motion.div>
        <h1 className="mt-3 text-center font-display text-[30px] font-extrabold leading-9 text-go-primary">¡Lección completada!</h1>
        <p className="mb-6 mt-1 text-center text-[15px] text-go-muted">Un día más construyendo tu inglés.</p>

        <div className="flex w-full gap-2">
          <StatCard label="XP ganado" tone="border-go-xp bg-go-xp text-go-text" delay={0.2}>
            <BoltIcon size={24} /> <span aria-label={`${summary.xpGained} XP`}>{xp}</span>
          </StatCard>
          <StatCard label="Precisión" tone="border-go-primary bg-go-primary text-white" delay={0.3}>
            <span className="text-go-primary" aria-hidden><CheckIcon size={20} /></span>
            <span className="text-go-primary" aria-label={`${summary.accuracy} por ciento`}>{acc}%</span>
          </StatCard>
          <StatCard label="Tiempo" tone="border-go-border bg-go-border text-go-text" delay={0.4}>
            <Timer size={20} aria-hidden className="text-go-muted" /> <span>{formatTime(summary.seconds)}</span>
          </StatCard>
        </div>

        <motion.div className="mt-3 flex w-full items-center justify-center gap-2 rounded-go border-2 border-go-border bg-go-surface py-3 font-display text-[20px] font-extrabold"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          <GemIcon size={26} /> <span>+{gems}</span> <span className="text-[14px] font-bold text-go-muted">gemas</span>
        </motion.div>

        {(summary.perfect || summary.fast) && (
          <div className="mt-4 flex w-full flex-col gap-2">
            {summary.perfect && (
              <motion.div className="flex items-center gap-3 rounded-go bg-go-primary-tint px-4 py-3 text-go-primary" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 }}>
                <CheckIcon size={20} />
                <span className="font-display text-[17px] font-extrabold">¡Lección perfecta! +{XP_PERFECT} XP</span>
              </motion.div>
            )}
            {summary.fast && (
              <motion.div className="flex items-center gap-3 rounded-go bg-go-xp/25 px-4 py-3 text-go-text" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.95 }}>
                <BoltIcon size={22} />
                <span className="font-display text-[17px] font-extrabold">¡Rápida! +{XP_FAST} XP</span>
              </motion.div>
            )}
          </div>
        )}
      </div>
      <div className="border-t-2 border-go-border px-4 pt-3" style={{ paddingBottom: 'calc(16px + var(--safe-bottom))' }}>
        <Button block onClick={onContinue} autoFocus>Continuar</Button>
      </div>
    </div>
  )
}
