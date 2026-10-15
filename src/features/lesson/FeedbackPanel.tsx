import { motion, useReducedMotion } from 'framer-motion'
import { Button, CheckIcon, CrossIcon, FlameIcon } from '@/design'
import type { Evaluation } from './evaluate'

export const CORRECT_MESSAGES = ['¡Genial!', '¡Bien ahí!', '¡Crack!', 'Perfect!', '¡Eso es!']
export const WRONG_MESSAGES = ['Casi.', 'No pasa nada, se aprende.', 'Uh, esa no.']
export const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)]

export function FeedbackPanel({ evaluation, message, explanation, extra, onContinue, last, streak = 0 }: {
  evaluation: Evaluation
  message: string
  explanation?: string
  /** Línea extra (ej. traducción). */
  extra?: string
  onContinue: () => void
  last?: boolean
  /** Aciertos seguidos: desde 3 se muestra el chip "¡N seguidas!". */
  streak?: number
}) {
  const reduce = useReducedMotion()
  const ok = evaluation.correct
  const tone = ok ? 'bg-go-primary-tint text-go-primary' : 'bg-go-danger-tint text-go-danger'
  return (
    <motion.div role="status" aria-live="assertive"
      initial={reduce ? { opacity: 0 } : { y: '100%' }} animate={reduce ? { opacity: 1 } : { y: 0 }} exit={reduce ? { opacity: 0 } : { y: '100%' }}
      transition={{ type: 'spring', damping: 26, stiffness: 320 }}
      className={`absolute inset-x-0 bottom-0 z-20 rounded-t-[24px] px-4 pt-4 ${tone}`}
      style={{ paddingBottom: 'calc(16px + var(--safe-bottom))' }}>
      {ok && streak >= 3 && (
        <motion.span initial={reduce ? false : { scale: 0.7, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} transition={{ type: 'spring', damping: 12, delay: 0.1 }}
          className="absolute bottom-full left-1/2 mb-3 inline-flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-go-text px-4 py-1.5 font-display text-[16px] font-extrabold text-white shadow-lg">
          <FlameIcon size={20} /> ¡{streak} seguidas!
        </motion.span>
      )}
      <div className="flex items-start gap-3">
        <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white ${ok ? 'animate-pop' : ''}`} aria-hidden>
          {ok ? <CheckIcon size={22} /> : <CrossIcon size={20} />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-[22px] font-extrabold leading-7">{message}</p>
          {evaluation.almost && (
            <p className="mt-1 text-[15px] font-bold">¡Ojo con la ortografía! Se escribe: <span lang="en" className="font-display">{evaluation.answerText}</span></p>
          )}
          {!ok && (
            <p className="mt-1 text-[15px]">
              <span className="font-bold">Respuesta correcta:</span>{' '}
              <span className="font-display text-[17px] font-bold">{evaluation.answerText}</span>
            </p>
          )}
          {extra && <p className="mt-1 text-[14px] text-go-text/80">{extra}</p>}
          {explanation && <p className="mt-1 text-[14px] leading-5 text-go-text">{explanation}</p>}
        </div>
      </div>
      <Button block variant={ok ? 'primary' : 'danger'} className="mt-4" onClick={onContinue} autoFocus>
        {last ? 'Terminar' : 'Continuar'}
      </Button>
    </motion.div>
  )
}
