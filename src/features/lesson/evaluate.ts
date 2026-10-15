import type { Exercise } from '@/domain/types'
import { checkBuilt, checkTyped, correctAnswerText } from '@/domain/validate'

/** Valor que emite cada ejercicio: índice, palabras, texto, resultado del unir pares o `true` (hablar). */
export type AnswerValue = number | string[] | string | { errors: number } | true

export interface Evaluation {
  correct: boolean
  /** Correcto pero con un typo: se avisa "¡Ojo con la ortografía!". */
  almost?: boolean
  /** Texto de la respuesta correcta para el panel de feedback. */
  answerText: string
}

/** En "unir pares" hasta este número de tropiezos se considera correcto. */
export const MATCH_MAX_ERRORS = 2

export function evaluate(ex: Exercise, value: AnswerValue): Evaluation {
  const answerText = correctAnswerText(ex)
  switch (ex.type) {
    case 'choose-translation':
    case 'listen-choose':
    case 'fill-blank':
    case 'choose-image':
      return { correct: value === ex.correct, answerText }
    case 'build-sentence': {
      const r = checkBuilt(value as string[], ex.accepted)
      return { correct: r.correct, answerText: r.best }
    }
    case 'type-translation':
    case 'listen-type': {
      const r = checkTyped(value as string, ex.accepted)
      if (r.verdict === 'correct') return { correct: true, answerText: r.best }
      if (r.verdict === 'almost') return { correct: true, almost: true, answerText: r.best }
      return { correct: false, answerText }
    }
    case 'match-pairs': {
      const errors = (value as { errors: number }).errors
      return { correct: errors <= MATCH_MAX_ERRORS, answerText }
    }
    case 'speak':
      return { correct: true, answerText }
  }
}
