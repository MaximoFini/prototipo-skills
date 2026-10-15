import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Skilly } from '@/design'
import { LessonRunner } from '@/features/lesson/LessonRunner'
import { levels, placementLevelFor, placementTest, allLessons } from '@/data/content'
import { useApp } from '@/store/useApp'
import { now } from '@/domain/clock'
import type { LevelId, RunnerResult } from '@/domain/types'

const ORDER: LevelId[] = ['A1', 'A2', 'B1']

export default function PlacementPage() {
  const nav = useNavigate()
  const [level, setLevel] = useState<LevelId | null>(null)

  const onComplete = (result: RunnerResult) => {
    const wrong = new Set(result.mistakes.map((m) => m.id))
    const correctIds = placementTest.filter((e) => !wrong.has(e.id)).map((e) => e.id)
    setLevel(placementLevelFor(correctIds))
  }

  const start = () => {
    if (!level) return
    const app = useApp.getState()
    app.setProfile({ level })
    const skip = ORDER.slice(0, ORDER.indexOf(level))
    if (skip.length) {
      const ids = levels.filter((l) => skip.includes(l.id)).flatMap((l) => l.units.filter((u) => !u.comingSoon).flatMap((u) => u.lessons.map((x) => x.id)))
        .filter((id) => allLessons.some((l) => l.id === id))
      app.patch((s) => {
        const completed = { ...s.completed }
        for (const id of ids) if (!completed[id]) completed[id] = { count: 1, bestAccuracy: 100, lastAt: now() }
        return { completed }
      })
    }
    nav('/', { replace: true })
  }

  if (placementTest.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
        <Skilly mood="think" size={110} />
        <p className="font-display text-[20px] font-extrabold text-go-text">El test de nivel todavía se está preparando</p>
        <p className="text-go-muted">Mientras tanto, arrancá desde cero. ¡Después te ubicamos!</p>
        <Button onClick={() => nav('/', { replace: true })}>Empezar</Button>
      </div>
    )
  }

  if (level) {
    const name = levels.find((l) => l.id === level)?.name ?? level
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 bg-go-primary-tint p-6 text-center">
        <Skilly mood="cheer" size={130} />
        <p className="font-display text-[15px] font-extrabold uppercase tracking-[0.08em] text-go-muted">Resultado del test</p>
        <h1 className="font-display text-[30px] font-extrabold leading-tight text-go-primary">Tu nivel: {name}</h1>
        <p className="max-w-[280px] text-go-text">{level === 'A1' ? '¡Genial para arrancar! Vamos paso a paso.' : '¡Qué nivel! Salteamos lo básico y arrancamos donde corresponde.'}</p>
        <Button block onClick={start} className="mt-4 max-w-[320px]">Empezar</Button>
      </div>
    )
  }

  return (
    <LessonRunner
      exercises={placementTest}
      mode="placement"
      consumesHearts={false}
      showFeedback={false}
      onExit={() => nav('/', { replace: true })}
      onComplete={onComplete}
      onOutOfHearts={onComplete}
    />
  )
}
