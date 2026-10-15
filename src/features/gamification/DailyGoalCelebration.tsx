import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { BoltIcon, Button, CheckIcon, Skilly } from '@/design'
import { sfx } from '@/lib/sfx'
import { burst } from '@/lib/confetti'

/** "¡Meta diaria cumplida!": aro completo animado y Skilly festejando. Ocupa todo el teléfono. */
export function DailyGoalCelebration({ goal, onContinue }: { goal: number; onContinue: () => void }) {
  const r = 70
  const c = 2 * Math.PI * r
  useEffect(() => {
    sfx.finish()
    const t = setTimeout(burst, 900)
    return () => clearTimeout(t)
  }, [])
  return (
    <div className="absolute inset-0 z-40 flex flex-col bg-white">
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="relative grid h-[200px] w-[200px] place-items-center">
          <svg width="200" height="200" viewBox="0 0 200 200" className="-rotate-90" aria-hidden>
            <circle cx="100" cy="100" r={r} fill="none" stroke="#E4DDD9" strokeWidth="16" />
            <motion.circle cx="100" cy="100" r={r} fill="none" stroke="#00522E" strokeWidth="16" strokeLinecap="round"
              strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: 0 }} transition={{ duration: 1.1, ease: 'easeOut' }} />
          </svg>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1, type: 'spring', stiffness: 220, damping: 12 }}
            className="absolute grid h-[84px] w-[84px] place-items-center rounded-full bg-go-primary text-white"><CheckIcon size={46} /></motion.div>
        </div>
        <motion.h1 initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }} className="mt-6 font-display text-[30px] font-extrabold leading-tight text-go-primary">
          ¡Meta diaria cumplida!
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="mt-2 flex items-center gap-1 font-display text-[22px] font-extrabold text-go-text">
          <BoltIcon size={28} /> {goal} XP hoy
        </motion.p>
        <p className="mt-1 text-go-muted">Hoy ya cumpliste. Lo demás es bonus.</p>
        <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="mt-5">
          <Skilly mood="cheer" size={120} className="animate-float" />
        </motion.div>
      </div>
      <div className="shrink-0 px-5 pt-2" style={{ paddingBottom: 'calc(20px + var(--safe-bottom))' }}>
        <Button block onClick={onContinue} className="!py-4 !text-[17px]">Continuar</Button>
      </div>
    </div>
  )
}
