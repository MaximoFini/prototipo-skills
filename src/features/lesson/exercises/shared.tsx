import { useMemo, type ReactNode } from 'react'
import { Turtle, Volume2 } from 'lucide-react'
import { CheckIcon, CrossIcon } from '@/design'
import { speak, ttsAvailable } from '@/lib/tts'
import { sfx } from '@/lib/sfx'
import type { Exercise } from '@/domain/types'
import type { AnswerValue } from '../evaluate'

export type Verdict = 'correct' | 'wrong' | null

export interface ExerciseProps<T extends Exercise = Exercise> {
  ex: T
  /** true una vez comprobado: no se puede cambiar la respuesta. */
  locked: boolean
  verdict: Verdict
  /** Respuesta actual (null = todavía no hay respuesta). */
  onAnswer: (v: AnswerValue | null) => void
  /** Omitir sin penalidad (audio / micrófono). */
  onSkip: () => void
}

/** Mezcla estable por montaje. */
export function useShuffled<T>(items: T[], key: unknown): T[] {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => {
    const a = [...items]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }, [key])
}

export function Instruction({ children }: { children: ReactNode }) {
  return <h2 className="mb-4 font-display text-[22px] font-extrabold leading-7 text-go-text">{children}</h2>
}

/** Frase en inglés destacada (Gabarito 600, más grande). */
export function EnglishText({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p lang="en" className={`font-display text-[24px] font-semibold leading-8 text-go-text ${className}`}>{children}</p>
}

/** Altavoz chico, al lado de una frase en inglés. */
export function SpeakerButton({ text, label = 'Escuchar' }: { text: string; label?: string }) {
  if (!ttsAvailable()) return null
  return (
    <button type="button" aria-label={label} onClick={() => speak(text)}
      className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-go-primary-tint text-go-primary active:scale-95">
      <Volume2 size={22} aria-hidden />
    </button>
  )
}

/** Altavoz grande + tortuga "lento" para los ejercicios de escuchar. */
export function ListenControls({ text }: { text: string }) {
  const tts = ttsAvailable()
  return (
    <div className="flex flex-col items-center gap-3">
      {tts ? (
        <div className="flex items-center justify-center gap-4">
          <button type="button" aria-label="Escuchar la frase" onClick={() => speak(text)}
            className="grid h-24 w-24 place-items-center rounded-[28px] border-b-4 border-go-primary-dark bg-go-primary text-white transition-transform active:translate-y-[3px] active:border-b">
            <Volume2 size={44} aria-hidden />
          </button>
          <button type="button" aria-label="Escuchar más lento" onClick={() => speak(text, { slow: true })}
            className="grid h-14 w-14 place-items-center rounded-2xl border-2 border-b-4 border-go-border bg-white text-go-primary active:translate-y-[2px]">
            <Turtle size={26} aria-hidden />
          </button>
        </div>
      ) : (
        <div className="w-full rounded-go border-2 border-go-border bg-go-surface p-4 text-center">
          <p className="mb-2 text-[13px] text-go-muted">Tu dispositivo no tiene voz en inglés. Te dejamos el texto:</p>
          <EnglishText>{text}</EnglishText>
        </div>
      )}
    </div>
  )
}

/** Lista de opciones de texto (choose-translation, listen-choose, fill-blank). */
export function ChoiceList({
  options, selected, onSelect, locked, verdict, correct, lang,
}: {
  options: string[]
  selected: number | null
  onSelect: (i: number) => void
  locked: boolean
  verdict: Verdict
  correct: number
  lang?: 'en' | 'es'
}) {
  return (
    <div role="radiogroup" className="flex flex-col gap-3">
      {options.map((o, i) => {
        const isSel = selected === i
        const showOk = locked && verdict === 'wrong' && i === correct
        const showBad = locked && isSel && verdict === 'wrong'
        const showGood = locked && isSel && verdict === 'correct'
        let cls = 'border-go-border bg-white text-go-text'
        if (showGood || showOk) cls = 'border-go-primary bg-go-primary-tint text-go-primary'
        else if (showBad) cls = 'border-go-danger bg-go-danger-tint text-go-danger'
        else if (isSel) cls = 'border-go-primary bg-go-primary-tint text-go-primary'
        return (
          <button key={i} type="button" role="radio" aria-checked={isSel} disabled={locked}
            onClick={() => { sfx.tap(); onSelect(i) }}
            className={`flex min-h-[56px] w-full items-center gap-3 rounded-go border-2 border-b-4 px-4 py-3 text-left text-[17px] font-medium transition-transform active:translate-y-[2px] ${cls}`}>
            <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg border-2 font-display text-[14px] font-extrabold ${isSel || showOk ? 'border-current' : 'border-go-border text-go-muted'}`} aria-hidden>
              {showBad ? <CrossIcon size={16} /> : showGood || showOk ? <CheckIcon size={16} /> : i + 1}
            </span>
            <span lang={lang} className={lang === 'en' ? 'font-display font-semibold' : ''}>{o}</span>
          </button>
        )
      })}
    </div>
  )
}
