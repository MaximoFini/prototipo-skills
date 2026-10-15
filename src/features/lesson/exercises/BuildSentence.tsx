import { useState } from 'react'
import type { BuildSentence as T } from '@/domain/types'
import { sfx } from '@/lib/sfx'
import { EnglishText, Instruction, SpeakerButton, useShuffled, type ExerciseProps } from './shared'

export function BuildSentenceExercise({ ex, locked, verdict, onAnswer }: ExerciseProps<T>) {
  const bank = useShuffled(ex.bank.map((w, i) => ({ w, i })), ex.id)
  const [picked, setPicked] = useState<number[]>([])
  const en = ex.promptLang === 'en'
  const word = (i: number) => ex.bank[i]
  const update = (next: number[]) => { setPicked(next); onAnswer(next.length ? next.map(word) : null) }
  const add = (i: number) => { if (locked || picked.includes(i)) return; sfx.tap(); update([...picked, i]) }
  const remove = (i: number) => { if (locked) return; sfx.tap(); update(picked.filter((p) => p !== i)) }
  const tone = verdict === 'correct' ? 'border-go-primary bg-go-primary-tint text-go-primary' : verdict === 'wrong' ? 'border-go-danger bg-go-danger-tint text-go-danger' : 'border-go-border bg-white text-go-text'
  return (
    <div>
      <Instruction>{en ? 'Armá la frase en español' : 'Armá la frase en inglés'}</Instruction>
      <div className="mb-5 flex items-center gap-3">
        {en && <SpeakerButton text={ex.prompt} />}
        {en ? <EnglishText>{ex.prompt}</EnglishText> : <p className="font-display text-[24px] font-semibold leading-8">{ex.prompt}</p>}
      </div>
      <div className="relative mb-6 min-h-[116px] rounded-go" aria-label="Tu frase" aria-live="polite">
        <div className="pointer-events-none absolute inset-0 flex flex-col" aria-hidden>
          {[0, 1].map((r) => <div key={r} className="h-[58px] border-b-2 border-go-border" />)}
        </div>
        <div className="relative flex flex-wrap gap-2 pt-2">
          {picked.map((i) => (
            <button key={i} type="button" disabled={locked} onClick={() => remove(i)} aria-label={`Quitar ${word(i)}`}
              className={`min-h-[44px] rounded-xl border-2 border-b-4 px-3.5 py-1.5 text-[17px] font-medium ${tone}`} lang={en ? 'es' : 'en'}>
              {word(i)}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {bank.map(({ w, i }) => {
          const used = picked.includes(i)
          return (
            <button key={i} type="button" disabled={locked || used} onClick={() => add(i)} aria-label={used ? `${w} (ya usada)` : w}
              className={`min-h-[44px] rounded-xl border-2 border-b-4 px-3.5 py-1.5 text-[17px] font-medium active:translate-y-[2px] ${used ? 'border-go-border bg-go-surface text-transparent' : 'border-go-border bg-white text-go-text'}`}
              lang={en ? 'es' : 'en'}>
              {w}
            </button>
          )
        })}
      </div>
    </div>
  )
}
