import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { X } from 'lucide-react'
import type { Exercise, RunnerResult } from '@/domain/types'
import { Button, HeartIcon, Modal, ProgressBar } from '@/design'
import { useApp } from '@/store/useApp'
import { now } from '@/domain/clock'
import { sfx } from '@/lib/sfx'
import { evaluate, type AnswerValue, type Evaluation } from './evaluate'
import { buildResult, currentItem, initLesson, lessonReducer, progressPct } from './lessonReducer'
import { ExerciseView } from './exercises/ExerciseView'
import { CORRECT_MESSAGES, FeedbackPanel, WRONG_MESSAGES, pick } from './FeedbackPanel'

/**
 * Motor de ejercicios reutilizable (lección, práctica, test de nivel).
 * La lógica de cola/estado vive en `lessonReducer.ts` (pura y testeada).
 */
export interface LessonRunnerProps {
  exercises: Exercise[]
  mode: 'lesson' | 'practice' | 'placement'
  /** Si false, los errores no restan corazones (práctica con corazones llenos, test de nivel). */
  consumesHearts: boolean
  /** Si false no muestra el panel verde/rojo de feedback (test de nivel). */
  showFeedback?: boolean
  onExit: () => void
  onComplete: (result: RunnerResult) => void
  /** Se llama cuando el alumno llega a 0 corazones durante la lección. */
  onOutOfHearts: (result: RunnerResult) => void
}

export function LessonRunner({ exercises, mode, consumesHearts, showFeedback = true, onExit, onComplete, onOutOfHearts }: LessonRunnerProps) {
  const reduce = useReducedMotion()
  const hearts = useApp((s) => s.hearts)
  const [state, dispatch] = useReducer(lessonReducer, undefined, () =>
    initLesson(exercises, { consumesHearts, hearts: useApp.getState().hearts, repeatMistakes: mode !== 'placement' }),
  )
  const startedAt = useRef(now())
  const finished = useRef(false)

  const [answer, setAnswer] = useState<AnswerValue | null>(null)
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null)
  const [message, setMessage] = useState('')
  const [confirmExit, setConfirmExit] = useState(false)
  const [heartHit, setHeartHit] = useState(0)

  const item = currentItem(state)
  const feedback = state.phase === 'feedback'
  const seconds = () => Math.max(0, Math.round((now() - startedAt.current) / 1000))

  // Fin de la cola o corte por corazones.
  useEffect(() => {
    if (state.status === 'playing' || finished.current) return
    finished.current = true
    const result = buildResult(state, seconds())
    if (state.status === 'done') onComplete(result)
    else onOutOfHearts(result)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status])

  const proceed = useCallback(() => {
    setAnswer(null)
    setEvaluation(null)
    dispatch({ type: 'continue' })
  }, [])

  const check = useCallback(() => {
    if (!item || answer === null || state.phase !== 'answering') return
    const ev = evaluate(item.ex, answer)
    setEvaluation(ev)
    setMessage(pick(ev.correct ? CORRECT_MESSAGES : WRONG_MESSAGES))
    dispatch({ type: 'answer', correct: ev.correct, flawed: ev.flawed })
    if (ev.correct) {
      sfx.correct()
      const run = state.streak + 1
      if (run >= 3) window.setTimeout(() => sfx.streak(), 250)
    } else {
      sfx.wrong()
      if (consumesHearts && useApp.getState().hearts > 0) {
        useApp.getState().loseHeart()
        setHeartHit((n) => n + 1)
        window.setTimeout(() => sfx.heartLost(), 200)
      }
    }
    if (!showFeedback) proceed()
  }, [item, answer, state.phase, state.streak, consumesHearts, showFeedback, proceed])

  // Par equivocado en "unir pares": cuesta un corazón en el acto (calco de Duolingo).
  const onMistake = useCallback(() => {
    if (!consumesHearts) return
    const had = useApp.getState().hearts > 0
    if (had) {
      useApp.getState().loseHeart()
      setHeartHit((n) => n + 1)
      window.setTimeout(() => sfx.heartLost(), 200)
    }
    dispatch({ type: 'heart-lost' })
  }, [consumesHearts])

  // Si estaba cortada por corazones y se recargaron (gemas, espera o práctica), sigue donde quedó.
  useEffect(() => {
    if (state.status !== 'out' || hearts <= 0) return
    finished.current = false
    setAnswer(null)
    setEvaluation(null)
    dispatch({ type: 'resume', hearts })
  }, [state.status, hearts])

  const skip = useCallback(() => {
    setAnswer(null)
    dispatch({ type: 'skip' })
  }, [])

  // Enter = comprobar / continuar.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || confirmExit) return
      if ((e.target as HTMLElement)?.tagName === 'BUTTON') return
      e.preventDefault()
      if (feedback) proceed()
      else check()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [feedback, confirmExit, proceed, check])

  const verdict = !feedback || !evaluation ? null : evaluation.correct ? 'correct' : 'wrong'
  const extra =
    item && (item.ex.type === 'listen-type' || item.ex.type === 'fill-blank') ? item.ex.translation : undefined

  return (
    <div className="relative flex h-full flex-col bg-white">
      {/* Cabecera */}
      <div className="flex items-center gap-3 px-4 pb-2" style={{ paddingTop: 'calc(12px + var(--safe-top))' }}>
        <button type="button" aria-label="Salir de la lección" onClick={() => setConfirmExit(true)}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-go-muted hover:bg-go-surface">
          <X size={26} strokeWidth={3} aria-hidden />
        </button>
        <div className="flex-1">
          {/* Con 3+ aciertos seguidos la barra se pone "en llamas" (naranja con halo). */}
          <ProgressBar value={progressPct(state)} height={16} shine={!reduce}
            color={state.streak >= 3 ? 'linear-gradient(90deg, #F2A33A, #F2C94C)' : undefined}
            glow={state.streak >= 3 ? 'rgba(242,163,58,.55)' : undefined} />
        </div>
        {mode !== 'placement' && (
          <motion.div key={heartHit} className={`flex min-w-[52px] items-center justify-end gap-1 font-display text-[18px] font-extrabold ${hearts === 0 ? 'text-go-muted' : 'text-go-heart'}`}
            aria-label={`${hearts} corazones`}
            initial={heartHit && !reduce ? { scale: 1.5, rotate: -15 } : false} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 12 }}>
            <HeartIcon size={28} broken={hearts === 0} />
            <span>{hearts}</span>
          </motion.div>
        )}
      </div>

      {/* Ejercicio */}
      <div className={`scroll-y flex-1 px-4 pt-4 ${feedback && showFeedback ? 'pb-72' : 'pb-8'}`}>
        {item && (
          <motion.div key={`${item.orig}-${item.attempt}`} className={verdict === 'wrong' ? 'animate-shake' : ''}
            initial={reduce ? false : { opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2, ease: 'easeOut' }}>
            {item.attempt > 0 && (
              <p className="mb-2 inline-block rounded-full bg-go-surface px-3 py-0.5 text-[12px] font-bold uppercase tracking-wider text-go-muted">Repaso</p>
            )}
            <div className={feedback ? 'pointer-events-none' : ''}>
              <ExerciseView ex={item.ex} locked={feedback} verdict={verdict} onAnswer={setAnswer} onSkip={skip} onMistake={onMistake} />
            </div>
          </motion.div>
        )}
      </div>

      {/* Pie: COMPROBAR */}
      <div className="border-t-2 border-go-border bg-white px-4 pt-3" style={{ paddingBottom: 'calc(16px + var(--safe-bottom))' }}>
        <Button block disabled={answer === null || feedback} onClick={check}>Comprobar</Button>
      </div>

      {/* Panel de feedback */}
      <AnimatePresence>
        {feedback && showFeedback && evaluation && item && (
          <FeedbackPanel key="fb" evaluation={evaluation} message={message} explanation={item.ex.explanation} extra={extra} streak={state.streak} onContinue={proceed} />
        )}
      </AnimatePresence>

      <Modal open={confirmExit} onClose={() => setConfirmExit(false)} sheet>
        <div className="flex flex-col items-center gap-2 text-center">
          <h2 className="font-display text-[24px] font-extrabold text-go-text">¿Seguro?</h2>
          <p className="mb-3 text-[16px] text-go-muted">Si salís ahora perdés tu progreso de esta lección.</p>
          <Button block onClick={() => setConfirmExit(false)}>Seguir practicando</Button>
          <Button block variant="ghost" className="!text-go-danger" onClick={onExit}>Salir</Button>
        </div>
      </Modal>
    </div>
  )
}
