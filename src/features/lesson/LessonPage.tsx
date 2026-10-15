import { useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import type { LessonSummary, RunnerResult } from '@/domain/types'
import { getLesson } from '@/data/content'
import { useApp } from '@/store/useApp'
import { DailyGoalCelebration } from '@/features/gamification/DailyGoalCelebration'
import { StreakExtendedScreen } from '@/features/gamification/StreakExtendedScreen'
import { LessonRunner } from './LessonRunner'
import { LessonResultScreen } from './LessonResultScreen'
import { OutOfHeartsModal } from './OutOfHeartsModal'

type Stage = 'run' | 'result' | 'goal' | 'streak'

export default function LessonPage() {
  const { lessonId } = useParams()
  const lesson = lessonId ? getLesson(lessonId) : undefined
  if (!lesson || !lessonId) return <Navigate to="/" replace />
  return <LessonFlow key={lessonId} lessonId={lessonId} exercises={lesson.exercises} />
}

function LessonFlow({ lessonId, exercises }: { lessonId: string; exercises: NonNullable<ReturnType<typeof getLesson>>['exercises'] }) {
  const navigate = useNavigate()
  const [stage, setStage] = useState<Stage>('run')
  const [summary, setSummary] = useState<LessonSummary | null>(null)
  // Sin corazones al entrar: no se arranca, se ofrece el modal.
  const [outOfHearts, setOutOfHearts] = useState(() => useApp.getState().hearts === 0)
  const [blocked] = useState(outOfHearts)
  const saved = useRef(false)

  const goHome = () => navigate('/', { replace: true })

  // Si estando cortada la lección vuelven los corazones (recarga o regeneración), se retoma donde quedó.
  const hearts = useApp((s) => s.hearts)
  useEffect(() => {
    if (!blocked && outOfHearts && hearts > 0) setOutOfHearts(false)
  }, [blocked, outOfHearts, hearts])

  const next = (from: Stage, s: LessonSummary) => {
    if (from === 'result' && s.goalReached) return setStage('goal')
    if ((from === 'result' || from === 'goal') && s.streakExtended) return setStage('streak')
    goHome()
  }

  const onComplete = (result: RunnerResult) => {
    if (saved.current) return
    saved.current = true
    setSummary(useApp.getState().finishLesson(lessonId, result))
    setStage('result')
  }

  const onOutOfHearts = (result: RunnerResult) => {
    useApp.getState().recordMistakes(lessonId, result.mistakes)
    setOutOfHearts(true)
  }

  return (
    <div className="h-full bg-white">
      {stage === 'run' && !blocked && (
        <LessonRunner exercises={exercises} mode="lesson" consumesHearts showFeedback onExit={goHome}
          onComplete={onComplete} onOutOfHearts={onOutOfHearts} />
      )}
      {stage === 'result' && summary && <LessonResultScreen summary={summary} onContinue={() => next('result', summary)} />}
      {stage === 'goal' && summary && (
        <DailyGoalCelebration goal={useApp.getState().settings.dailyGoal} onContinue={() => next('goal', summary)} />
      )}
      {stage === 'streak' && summary && <StreakExtendedScreen streak={summary.streak} onContinue={goHome} />}
      <OutOfHeartsModal open={outOfHearts} onClose={goHome} onRefilled={() => setOutOfHearts(false)} onPractice={() => navigate('/practice/session?heal=1', { replace: true })} />
    </div>
  )
}
