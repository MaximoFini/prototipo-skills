import type { Exercise, RunnerResult } from '@/domain/types'

/** Cuántas veces se repite como máximo un ejercicio fallado. */
export const MAX_REPEATS = 2

export interface QueueItem {
  ex: Exercise
  /** Índice del ejercicio original (estable aunque se repita). */
  orig: number
  /** 0 = original, 1 y 2 = repeticiones. */
  attempt: number
}

export interface LessonState {
  queue: QueueItem[]
  /** Cantidad de ejercicios originales. */
  total: number
  phase: 'answering' | 'feedback'
  lastCorrect: boolean | null
  /** orig -> resultado del primer intento. */
  firstTry: Record<number, boolean>
  /** orig de los ejercicios omitidos (sin penalidad, no cuentan en la precisión). */
  skipped: number[]
  /** orig de los ejercicios ya resueltos (bien, omitidos o con repeticiones agotadas). */
  done: Record<number, true>
  streak: number
  bestStreak: number
  hearts: number
  heartsLost: number
  consumesHearts: boolean
  /** Si el ejercicio fallado se repite al final (false en el test de nivel). */
  repeatMistakes: boolean
  status: 'playing' | 'done' | 'out'
  /** Desde dónde se cortó por corazones: tras responder (hay que descartar el ejercicio) o a mitad de unir pares. */
  outFrom: 'answer' | 'match' | null
  exercises: Exercise[]
}

export type LessonAction =
  | { type: 'answer'; correct: boolean; /** correcto pero con tropiezos (unir pares con errores): cuenta como error sin repetirse. */ flawed?: boolean }
  | { type: 'skip' }
  | { type: 'continue' }
  /** Un par equivocado en "unir pares": resta un corazón al instante (como Duolingo). */
  | { type: 'heart-lost' }
  /** Se recargaron corazones: sigue donde quedó. */
  | { type: 'resume'; hearts: number }

export function initLesson(exercises: Exercise[], opts: { consumesHearts: boolean; hearts: number; repeatMistakes?: boolean }): LessonState {
  return {
    queue: exercises.map((ex, orig) => ({ ex, orig, attempt: 0 })),
    total: exercises.length,
    phase: 'answering',
    lastCorrect: null,
    firstTry: {},
    skipped: [],
    done: {},
    streak: 0,
    bestStreak: 0,
    hearts: opts.hearts,
    heartsLost: 0,
    consumesHearts: opts.consumesHearts,
    repeatMistakes: opts.repeatMistakes ?? true,
    status: exercises.length === 0 ? 'done' : 'playing',
    outFrom: null,
    exercises,
  }
}

export function currentItem(s: LessonState): QueueItem | undefined {
  return s.queue[0]
}

/** Avance 0..100 por ejercicios originales resueltos. */
export function progressPct(s: LessonState): number {
  if (s.total === 0) return 100
  return (Object.keys(s.done).length / s.total) * 100
}

export function lessonReducer(s: LessonState, a: LessonAction): LessonState {
  if (a.type === 'resume') {
    if (s.status !== 'out') return s
    // Tras un error se descarta el ejercicio fallado (ya quedó repetido al final); en unir pares se reintenta.
    const queue = s.outFrom === 'answer' ? s.queue.slice(1) : s.queue
    return { ...s, hearts: a.hearts, status: queue.length === 0 ? 'done' : 'playing', outFrom: null, phase: 'answering', lastCorrect: null, queue }
  }
  if (s.status !== 'playing') return s
  const item = s.queue[0]
  if (!item) return s

  switch (a.type) {
    case 'answer': {
      if (s.phase !== 'answering') return s
      if (a.correct) {
        const streak = a.flawed ? 0 : s.streak + 1
        return {
          ...s,
          phase: 'feedback',
          lastCorrect: true,
          streak,
          bestStreak: Math.max(s.bestStreak, streak),
          firstTry: item.attempt === 0 ? { ...s.firstTry, [item.orig]: !a.flawed } : s.firstTry,
          done: { ...s.done, [item.orig]: true },
        }
      }
      const repeat = s.repeatMistakes && item.attempt < MAX_REPEATS
      const lose = s.consumesHearts && s.hearts > 0
      return {
        ...s,
        phase: 'feedback',
        lastCorrect: false,
        streak: 0,
        firstTry: item.attempt === 0 ? { ...s.firstTry, [item.orig]: false } : s.firstTry,
        queue: repeat ? [...s.queue, { ...item, attempt: item.attempt + 1 }] : s.queue,
        done: repeat ? s.done : { ...s.done, [item.orig]: true },
        hearts: lose ? s.hearts - 1 : s.hearts,
        heartsLost: s.heartsLost + (lose ? 1 : 0),
      }
    }
    case 'skip': {
      if (s.phase !== 'answering') return s
      const queue = s.queue.slice(1)
      return {
        ...s,
        queue,
        skipped: s.skipped.includes(item.orig) ? s.skipped : [...s.skipped, item.orig],
        done: { ...s.done, [item.orig]: true },
        status: queue.length === 0 ? 'done' : 'playing',
      }
    }
    case 'continue': {
      if (s.phase !== 'feedback') return s
      if (s.consumesHearts && s.hearts === 0 && s.lastCorrect === false) {
        return { ...s, status: 'out', outFrom: 'answer', phase: 'answering' }
      }
      const queue = s.queue.slice(1)
      return { ...s, queue, phase: 'answering', lastCorrect: null, status: queue.length === 0 ? 'done' : 'playing' }
    }
    case 'heart-lost': {
      if (s.phase !== 'answering' || !s.consumesHearts || s.hearts <= 0) return s
      const hearts = s.hearts - 1
      return {
        ...s,
        hearts,
        heartsLost: s.heartsLost + 1,
        streak: 0,
        firstTry: item.attempt === 0 ? { ...s.firstTry, [item.orig]: false } : s.firstTry,
        status: hearts === 0 ? 'out' : s.status,
        outFrom: hearts === 0 ? 'match' : s.outFrom,
      }
    }
  }
}

/** Resultado (parcial si todavía no terminó). Solo cuenta el primer intento de cada ejercicio original. */
export function buildResult(s: LessonState, seconds: number): RunnerResult {
  const answered = Object.keys(s.firstTry).map(Number)
  const correct = answered.filter((i) => s.firstTry[i]).length
  const mistakes = answered.filter((i) => !s.firstTry[i]).sort((x, y) => x - y).map((i) => s.exercises[i])
  return {
    correct,
    total: answered.length,
    mistakes,
    seconds,
    perfect: mistakes.length === 0,
    heartsLost: s.heartsLost,
    completed: s.status === 'done',
  }
}
