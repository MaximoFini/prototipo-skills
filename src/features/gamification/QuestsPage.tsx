import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'
import { ChestIcon, CheckIcon, GemIcon, GemChip, ProgressBar, Skilly, StreakChip, BoltIcon, Button } from '@/design'
import type { SkillyMood } from '@/design'
import { selectXpToday, useApp } from '@/store/useApp'
import { now } from '@/domain/clock'
import { formatCountdown } from '@/domain/rules'
import type { QuestState } from '@/domain/types'
import { isClaimable, isComplete, msToEndOfDay } from './quests'
import { claimQuest, ensureTodayQuests } from './questActions'

function useTick(ms = 1000) {
  const [, set] = useState(0)
  useEffect(() => {
    const i = setInterval(() => set((n) => n + 1), ms)
    return () => clearInterval(i)
  }, [ms])
}

function GoalRing({ value, goal }: { value: number; goal: number }) {
  const pct = Math.min(1, goal ? value / goal : 0)
  const r = 34
  const c = 2 * Math.PI * r
  const done = pct >= 1
  return (
    <div className="relative grid h-[88px] w-[88px] shrink-0 place-items-center" role="img" aria-label={`${value} de ${goal} XP hoy`}>
      <svg width="88" height="88" viewBox="0 0 88 88" className="-rotate-90">
        <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(255,255,255,.25)" strokeWidth="10" />
        <motion.circle cx="44" cy="44" r={r} fill="none" stroke="#F2C94C" strokeWidth="10" strokeLinecap="round"
          strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c * (1 - pct) }} transition={{ duration: 0.9, ease: 'easeOut' }} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-white">
        {done ? <CheckIcon size={34} /> : <div className="text-center font-display leading-none"><div className="text-[22px] font-extrabold">{value}</div><div className="text-[11px] font-bold opacity-80">/ {goal}</div></div>}
      </div>
    </div>
  )
}

function QuestCard({ q, onClaim }: { q: QuestState; onClaim: (q: QuestState) => void }) {
  const done = isComplete(q)
  const claimable = isClaimable(q)
  return (
    <motion.li layout className={`card-go flex items-center gap-3 p-3 ${claimable ? 'border-go-xp bg-[#FFFBEA]' : ''}`}>
      <div className="min-w-0 flex-1">
        <p className={`font-display text-[17px] font-extrabold leading-tight ${q.claimed ? 'text-go-muted' : 'text-go-text'}`}>{q.title}</p>
        <div className="mt-2 flex items-center gap-2">
          <ProgressBar value={(q.progress / q.target) * 100} color={done ? '#F2A33A' : '#00522E'} height={14} />
          <span className="w-9 shrink-0 text-right font-display text-[14px] font-extrabold text-go-muted">{q.progress}/{q.target}</span>
        </div>
        {claimable ? (
          <Button variant="xp" className="mt-3 !py-2 !text-[14px]" onClick={() => onClaim(q)} aria-label={`Reclamar ${q.rewardGems} gemas`}>
            Reclamar <GemIcon size={18} /> {q.rewardGems}
          </Button>
        ) : q.claimed ? (
          <p className="mt-2 flex items-center gap-1 text-[13px] font-bold text-go-primary"><CheckIcon size={16} /> Reclamado</p>
        ) : (
          <p className="mt-2 flex items-center gap-1 text-[13px] font-bold text-go-muted"><GemIcon size={16} /> {q.rewardGems} gemas al completar</p>
        )}
      </div>
      <motion.div animate={claimable ? { rotate: [0, -8, 8, -6, 6, 0], scale: [1, 1.08, 1] } : {}} transition={{ repeat: claimable ? Infinity : 0, duration: 1.4, repeatDelay: 0.8 }}
        className={`grid h-[60px] w-[60px] shrink-0 place-items-center rounded-2xl ${claimable ? 'bg-go-xp/30' : 'bg-go-surface'}`}>
        <ChestIcon size={44} open={q.claimed || claimable} style={{ opacity: done ? 1 : 0.55 }} />
      </motion.div>
    </motion.li>
  )
}

function advice(daily: QuestState[], xpToday: number, goal: number): { mood: SkillyMood; text: string } {
  const done = daily.filter(isComplete).length
  if (!daily.length) return { mood: 'think', text: 'Estoy armando tus misiones…' }
  if (done === daily.length) return { mood: 'cheer', text: '¡Las completaste todas! Sos una máquina. Mañana hay más.' }
  if (xpToday >= goal) return { mood: 'wink', text: '¡Meta del día cumplida! Las misiones que faltan son puro bonus.' }
  if (done === 0 && xpToday === 0) return { mood: 'happy', text: 'Una lección y ya arrancás con tres misiones en marcha.' }
  return { mood: 'happy', text: 'Las lecciones perfectas suman a dos misiones a la vez. Concentrate.' }
}

export default function QuestsPage() {
  useTick()
  const quests = useApp((s) => s.quests)
  const xpToday = useApp(selectXpToday)
  const goal = useApp((s) => s.settings.dailyGoal)
  const [gain, setGain] = useState<number | null>(null)

  useEffect(() => { ensureTodayQuests() }, [])
  useEffect(() => {
    if (gain === null) return
    const t = setTimeout(() => setGain(null), 2200)
    return () => clearTimeout(t)
  }, [gain])

  const onClaim = (q: QuestState) => { const g = claimQuest(q.id); if (g) setGain(g) }
  const left = msToEndOfDay(now())
  const monthly = quests.monthly
  const tip = advice(quests.daily, xpToday, goal)
  const doneCount = quests.daily.filter(isComplete).length
  const mClaimable = monthly ? isClaimable(monthly) : false

  return (
    <div className="flex h-full flex-col bg-white">
      <header className="flex shrink-0 items-center justify-between px-4 pb-2 pt-3" style={{ paddingTop: 'calc(12px + var(--safe-top))' }}>
        <h1 className="font-display text-[22px] font-extrabold">Misiones</h1>
        <div className="flex items-center gap-1"><StreakChip /><GemChip /></div>
      </header>

      <div className="scroll-y relative flex-1 px-4 pb-6" tabIndex={0}>
        {gain !== null && (
          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center" role="status">
            <span className="flex items-center gap-1 rounded-full bg-go-xp px-4 py-2 font-display text-[17px] font-extrabold text-go-text shadow-lg">+{gain} <GemIcon size={20} /> ¡Cofre abierto!</span>
          </motion.div>
        )}

        <section className="flex items-center gap-4 rounded-[20px] bg-go-primary p-4 text-white">
          <GoalRing value={Math.min(xpToday, goal)} goal={goal} />
          <div className="min-w-0 flex-1">
            <p className="font-display text-[13px] font-bold uppercase tracking-[0.06em] opacity-80">Meta diaria</p>
            <p className="flex items-center gap-1 font-display text-[20px] font-extrabold leading-tight"><BoltIcon size={22} /> {xpToday} / {goal} XP</p>
            <p className="mt-1 text-[14px] opacity-90">{xpToday >= goal ? '¡Cumplida! Seguí sumando.' : `Te faltan ${goal - xpToday} XP para hoy.`}</p>
          </div>
        </section>

        <div className="mt-5 flex items-end justify-between">
          <h2 className="font-display text-[19px] font-extrabold">Misiones del día</h2>
          <span className="flex items-center gap-1 text-[13px] font-bold text-go-heart"><Clock size={15} strokeWidth={3} aria-hidden /> {formatCountdown(left)}<span className="sr-only"> para que termine el día</span></span>
        </div>
        <p className="mb-2 text-[13px] text-go-muted">{doneCount}/{quests.daily.length || 3} completadas</p>

        {quests.daily.length === 0 ? (
          <div className="card-go grid place-items-center gap-2 p-6 text-center text-go-muted">
            <Skilly mood="think" size={72} />
            <p className="font-bold">Preparando tus misiones…</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {quests.daily.map((q) => <QuestCard key={q.id} q={q} onClaim={onClaim} />)}
          </ul>
        )}

        {monthly && (
          <section className="mt-6" aria-label="Misión del mes">
            <div className={`relative overflow-hidden rounded-[20px] border-2 ${mClaimable ? 'border-go-xp' : 'border-go-danger'} bg-white`}>
              <div className="bg-go-danger px-4 py-1.5 text-center font-display text-[13px] font-extrabold uppercase tracking-[0.12em] text-white">Misión del mes</div>
              <div className="p-4">
                <p className="font-display text-[18px] font-extrabold leading-tight">{monthly.title}</p>
                <div className="mt-3 flex items-center gap-2">
                  <ProgressBar value={(monthly.progress / monthly.target) * 100} color="#B8252B" height={16} />
                  <span className="shrink-0 font-display text-[14px] font-extrabold text-go-muted">{monthly.progress}/{monthly.target}</span>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="flex items-center gap-1 text-[14px] font-bold text-go-muted"><GemIcon size={20} /> {monthly.rewardGems} gemas de premio</p>
                  {mClaimable ? (
                    <Button variant="xp" className="!py-2 !text-[14px]" onClick={() => onClaim(monthly)}>Reclamar</Button>
                  ) : monthly.claimed ? (
                    <span className="flex items-center gap-1 text-[13px] font-bold text-go-primary"><CheckIcon size={16} /> Reclamado</span>
                  ) : (
                    <ChestIcon size={40} style={{ opacity: 0.55 }} />
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        <div className="mt-6 flex items-center gap-3 rounded-[20px] bg-go-surface p-3">
          <Skilly mood={tip.mood} size={64} className="shrink-0" />
          <p className="text-[14px] font-medium leading-snug">{tip.text}</p>
        </div>
      </div>
    </div>
  )
}
