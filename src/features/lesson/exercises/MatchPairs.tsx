import { useEffect, useRef, useState } from 'react'
import type { MatchPairs as T } from '@/domain/types'
import { sfx } from '@/lib/sfx'
import { speak, ttsAvailable } from '@/lib/tts'
import { Instruction, useShuffled, type ExerciseProps } from './shared'

type Side = 'en' | 'es'

export function MatchPairsExercise({ ex, locked, onAnswer, onMistake }: ExerciseProps<T>) {
  const enOrder = useShuffled(ex.pairs.map((p, i) => ({ t: p.en, i })), ex.id + 'en')
  const esOrder = useShuffled(ex.pairs.map((p, i) => ({ t: p.es, i })), ex.id + 'es')
  const [sel, setSel] = useState<{ side: Side; i: number } | null>(null)
  const [matched, setMatched] = useState<number[]>([])
  const [wrong, setWrong] = useState<{ en: number; es: number } | null>(null)
  const errors = useRef(0)
  const timer = useRef<ReturnType<typeof setTimeout>>()
  useEffect(() => () => clearTimeout(timer.current), [])

  const tap = (side: Side, i: number, text: string) => {
    if (locked || wrong || matched.includes(i)) return
    if (side === 'en' && ttsAvailable()) speak(text)
    else sfx.tap()
    if (!sel || sel.side === side) { setSel({ side, i }); return }
    const [enI, esI] = side === 'es' ? [sel.i, i] : [i, sel.i]
    if (enI === esI) {
      const next = [...matched, enI]
      setMatched(next)
      setSel(null)
      sfx.correct()
      if (next.length === ex.pairs.length) onAnswer({ errors: errors.current })
    } else {
      errors.current += 1
      onMistake?.()
      sfx.wrong()
      setWrong({ en: enI, es: esI })
      setSel(null)
      timer.current = setTimeout(() => setWrong(null), 450)
    }
  }

  const col = (side: Side, items: { t: string; i: number }[]) => (
    <div className="flex flex-1 flex-col gap-3">
      {items.map(({ t, i }) => {
        const isDone = matched.includes(i)
        const isSel = sel?.side === side && sel.i === i
        const isWrong = wrong && wrong[side] === i
        let cls = 'border-go-border bg-white text-go-text'
        if (isDone) cls = 'border-go-primary bg-go-primary-tint text-go-primary opacity-50'
        else if (isWrong) cls = 'border-go-danger bg-go-danger-tint text-go-danger animate-shake'
        else if (isSel) cls = 'border-go-primary bg-go-primary-tint text-go-primary'
        return (
          <button key={i} type="button" disabled={isDone || locked} aria-pressed={isSel}
            aria-label={isDone ? `${t} (unido)` : t} lang={side}
            onClick={() => tap(side, i, t)}
            className={`min-h-[56px] rounded-go border-2 border-b-4 px-2 py-2 text-[16px] font-medium leading-5 transition-transform active:translate-y-[2px] ${side === 'en' ? 'font-display font-semibold' : ''} ${cls}`}>
            {t}
          </button>
        )
      })}
    </div>
  )

  return (
    <div>
      <Instruction>Uní cada palabra con su traducción</Instruction>
      <p className="mb-4 -mt-2 text-[14px] text-go-muted" aria-live="polite">{matched.length} de {ex.pairs.length} pares</p>
      <div className="flex gap-3">
        {col('en', enOrder)}
        {col('es', esOrder)}
      </div>
    </div>
  )
}
