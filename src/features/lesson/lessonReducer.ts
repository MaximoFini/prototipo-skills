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
  status: 'playing' | 'done' | 'out'
  exercises: Exercise[]
}

export type LessonAction =
  | { type: 'answer'; correct: boolean }
  | { type: 'skip' }
  | { type: 'continue' }

export function initLesson(exercises: Exercise[], opts: { consumesHearts: boolean; hearts: number }): LessonState {
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
    status: exercises.length === 0 ? 'done' : 'playing',
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
  if (s.status !== 'playing') return s
  const item = s.queue[0]
  if (!item) return s

  switch (a.type) {
    case 'answer': {
      if (s.phase !== 'answering') return s
      if (a.correct) {
        const streak = s.streak + 1
        return {
          ...s,
          phase: 'feedback',
          lastCorrect: true,
          streak,
          bestStreak: Math.max(s.bestStreak, streak),
          firstTry: item.attempt === 0 ? { ...s.firstTry, [item.orig]: true } : s.firstTry,
          done: { ...s.done, [item.orig]: true },
        }
      }
      const repeat = item.attempt < MAX_REPEATS
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
        return { ...s, status: 'out', phase: 'answering' }
      }
      const queue = s.queue.slice(1)
      return { ...s, queue, phase: 'answering', lastCorrect: null, status: queue.length === 0 ? 'done' : 'playing' }
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
