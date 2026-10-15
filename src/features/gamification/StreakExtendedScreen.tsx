import { useEffect, useState } from 'react'
import { animate, motion } from 'framer-motion'
import { Snowflake } from 'lucide-react'
import { Button, CheckIcon, FlameIcon, Skilly } from '@/design'
import type { SkillyMood } from '@/design'
import { useApp } from '@/store/useApp'
import { addDays, today, weekStart } from '@/domain/clock'
import { sfx } from '@/lib/sfx'
import { celebrate } from '@/lib/confetti'

/**
 * Pantalla "racha extendida": llama animada, número de racha con conteo, calendario semanal (L-D)
 * con los días practicados y botón CONTINUAR. Ocupa todo el teléfono (absolute inset-0).
 */
export interface StreakExtendedScreenProps {
  streak: number
  onContinue: () => void
}

const LETTERS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
const reduced = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

export function streakMessage(n: number): { mood: SkillyMood; title: string; text: string } {
  if (n >= 21) return { mood: 'cheer', title: '¡21 días! Sos leyenda.', text: 'Tres semanas seguidas. Esto ya es un hábito de verdad.' }
  if (n >= 14) return { mood: 'cheer', title: '¡Dos semanas seguidas!', text: 'Ya sos de los que no se rinden. Falta poquito para los 21.' }
  if (n >= 7) return { mood: 'cheer', title: '¡Una semana entera!', text: 'Siete días sin faltar. Tu inglés lo nota.' }
  if (n >= 3) return { mood: 'wink', title: '¡Tres días y contando!', text: 'Ya le agarraste el ritmo. No lo sueltes.' }
  if (n <= 1) return { mood: 'happy', title: '¡Prendiste la llama!', text: 'Primer día. Volvé mañana y la hacemos crecer.' }
  return { mood: 'happy', title: '¡Seguí así!', text: 'Un día más, una llama más grande.' }
}

export function StreakExtendedScreen({ streak, onContinue }: StreakExtendedScreenProps) {
  const days = useApp((s) => s.streak.days)
  const frozen = useApp((s) => s.streak.frozenDays)
  const [shown, setShown] = useState(reduced() ? streak : Math.max(0, streak - 1))
  const msg = streakMessage(streak)
  const t = today()
  const start = weekStart(t)
  const week = Array.from({ length: 7 }, (_, i) => addDays(start, i))

  useEffect(() => {
    sfx.streak()
    celebrate()
    if (reduced()) return
    const c = animate(Math.max(0, streak - 1), streak, { duration: 1.1, delay: 0.5, ease: 'easeOut', onUpdate: (v) => setShown(Math.round(v)) })
    return () => c.stop()
  }, [streak])

  return (
    <div className="absolute inset-0 z-40 flex flex-col overflow-hidden text-white" style={{ background: 'radial-gradient(circle at 50% 28%, #1E7A4A 0%, #00522E 55%, #003B20 100%)' }}>
      <div className="relative flex flex-1 flex-col items-center justify-center px-6 pt-8 text-center">
        <motion.div aria-hidden className="absolute h-[260px] w-[260px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(242,163,58,.55), rgba(242,163,58,0) 70%)' }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }} transition={{ repeat: Infinity, duration: 2 }} />
        <motion.div initial={{ scale: 0, rotate: -15 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 180, damping: 12 }} className="relative">
          <motion.div animate={{ scale: [1, 1.07, 1], rotate: [-3, 3, -3] }} transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}>
            <FlameIcon size={150} />
          </motion.div>
        </motion.div>
        <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="relative mt-2 font-display font-extrabold leading-none text-go-streak" style={{ fontSize: 96 }} aria-label={`${streak} días de racha`}>
          {shown}
        </motion.p>
        <p className="relative font-display text-[26px] font-extrabold" aria-hidden>{streak === 1 ? '¡1 día de racha!' : `¡${streak} días de racha!`}</p>
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="relative mt-1 font-display text-[18px] font-bold text-go-xp">{msg.title}</motion.h1>

        <div className="relative mt-5 w-full rounded-[20px] bg-white p-4 text-go-text shadow-lg">
          <div className="flex justify-between">
            {week.map((d, i) => {
              const isToday = d === t
              const practiced = days.includes(d) || (isToday && streak > 0)
              const isFrozen = !practiced && frozen.includes(d)
              return (
                <div key={d} className="flex flex-col items-center gap-1.5">
                  <span className={`text-[13px] font-extrabold ${isToday ? 'text-go-primary' : 'text-go-muted'}`}>{LETTERS[i]}</span>
                  <motion.span initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={{ delay: 0.2 + i * 0.06, type: 'spring' }}
                    role="img" aria-label={`${LETTERS[i]}: ${practiced ? 'practicaste' : isFrozen ? 'día congelado' : 'sin práctica'}${isToday ? ' (hoy)' : ''}`}
                    className={`grid h-9 w-9 place-items-center rounded-full border-2 ${practiced ? 'border-go-streak bg-go-streak text-go-text' : isFrozen ? 'border-[#9AD0FA] bg-[#E3F1FD] text-[#1F5FA8]' : 'border-go-border bg-go-surface text-go-muted'} ${isToday ? 'ring-4 ring-go-primary/30' : ''}`}>
                    {practiced ? <CheckIcon size={18} /> : isFrozen ? <Snowflake size={18} strokeWidth={2.8} aria-hidden /> : null}
                  </motion.span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="relative mt-4 flex items-center gap-3 text-left">
          <Skilly mood={msg.mood} size={64} className="shrink-0" />
          <p className="rounded-2xl bg-white/15 p-3 text-[14px] font-medium leading-snug">{msg.text}</p>
        </div>
      </div>
      <div className="shrink-0 px-5 pt-2" style={{ paddingBottom: 'calc(20px + var(--safe-bottom))' }}>
        <Button variant="xp" block onClick={onContinue} className="!py-4 !text-[17px]">Continuar</Button>
      </div>
    </div>
  )
}
