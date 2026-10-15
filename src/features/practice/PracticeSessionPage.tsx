import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button, HeartIcon, Skilly } from '@/design'
import { LessonRunner } from '@/features/lesson/LessonRunner'
import { useApp } from '@/store/useApp'
import { allLessons } from '@/data/content'
import { emit } from '@/domain/events'
import { HEARTS_MAX, PRACTICE_EXERCISES } from '@/domain/rules'
import type { Exercise, RunnerResult } from '@/domain/types'
import { burst } from '@/lib/confetti'
import { sfx } from '@/lib/sfx'

interface Plan {
  exercises: Exercise[]
  /** id de ejercicio -> key del error guardado (lessonId:exerciseId). */
  keys: Map<string, string>
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Errores más recientes primero; si faltan, completa con ejercicios de lecciones hechas (o las primeras). */
function buildPlan(): Plan {
  const s = useApp.getState()
  const keys = new Map<string, string>()
  const exercises: Exercise[] = []
  const seen = new Set<string>()
  for (const m of [...s.mistakes].sort((a, b) => b.at - a.at)) {
    if (exercises.length >= PRACTICE_EXERCISES) break
    if (seen.has(m.exercise.id)) continue
    seen.add(m.exercise.id)
    exercises.push(m.exercise)
    keys.set(m.exercise.id, m.key)
  }
  if (exercises.length < PRACTICE_EXERCISES) {
    const done = allLessons.filter((l) => s.completed[l.id])
    const source = done.length > 0 ? done : allLessons.slice(0, 3)
    const pool = shuffle(source.flatMap((l) => l.exercises)).filter((e) => e.type !== 'speak' && !seen.has(e.id))
    for (const e of pool) {
      if (exercises.length >= PRACTICE_EXERCISES) break
      seen.add(e.id)
      exercises.push(e)
    }
  }
  return { exercises, keys }
}

export default function PracticeSessionPage() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const healParam = params.get('heal') === '1'
  const [plan] = useState<Plan>(buildPlan)
  const [initialHearts] = useState(() => useApp.getState().hearts)
  const [summary, setSummary] = useState<null | { xp: number; healed: boolean; correct: number; total: number }>(null)

  const onComplete = (result: RunnerResult) => {
    const s = useApp.getState()
    const wrong = new Set(result.mistakes.map((m) => m.id))
    for (const [exId, key] of plan.keys) if (!wrong.has(exId)) s.clearMistake(key)
    const heal = healParam || initialHearts < HEARTS_MAX
    const before = s.streak.count
    const { xpGained } = s.finishPractice(result, { healHeart: heal })
    const after = useApp.getState().streak.count
    if (after !== before) emit('streak-changed', { count: after })
    sfx.finish()
    burst()
    setSummary({ xp: xpGained, healed: heal && initialHearts < HEARTS_MAX, correct: result.correct, total: result.total })
  }

  if (summary) {
    return (
      <div className="flex h-full flex-col items-center bg-white px-6 text-center" style={{ paddingTop: 'calc(24px + var(--safe-top))', paddingBottom: 'calc(20px + var(--safe-bottom))' }}>
        <div className="flex flex-1 flex-col items-center justify-center gap-3">
          <Skilly mood="cheer" size={110} />
          <h1 className="font-display text-[30px] font-extrabold text-go-primary">¡Práctica completa!</h1>
          <p className="text-[15px] text-go-muted">Acertaste {summary.correct} de {summary.total}. Repasar es de campeones.</p>
          <div className="mt-2 flex items-center gap-2 rounded-go bg-go-xp px-5 py-3 font-display text-[26px] font-extrabold text-go-text">+{summary.xp} XP</div>
          {summary.healed && (
            <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', delay: 0.3 }} className="mt-2 flex items-center gap-2 rounded-go bg-go-danger-tint px-5 py-3 font-display text-[18px] font-extrabold text-go-danger">
              <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1.1 }}><HeartIcon size={32} /></motion.span>
              ¡Recuperaste 1 corazón!
            </motion.div>
          )}
        </div>
        <Button block onClick={() => nav('/')} className="max-w-[360px]">Volver</Button>
      </div>
    )
  }

  if (plan.exercises.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
        <Skilly mood="think" size={96} />
        <p className="text-go-muted">No hay ejercicios para repasar todavía. ¡Hacé una lección primero!</p>
        <Button onClick={() => nav('/')}>Volver</Button>
      </div>
    )
  }

  return (
    <LessonRunner
      exercises={plan.exercises}
      mode="practice"
      consumesHearts={false}
      onExit={() => nav('/practice')}
      onComplete={onComplete}
      onOutOfHearts={() => nav('/practice')}
    />
  )
}
