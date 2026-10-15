import { useState } from 'react'
import type { ChooseImage as T } from '@/domain/types'
import { CheckIcon, CrossIcon } from '@/design'
import { sfx } from '@/lib/sfx'
import { EnglishText, Instruction, SpeakerButton, type ExerciseProps } from './shared'

export function ChooseImageExercise({ ex, locked, verdict, onAnswer }: ExerciseProps<T>) {
  const [sel, setSel] = useState<number | null>(null)
  return (
    <div>
      <Instruction>¿Cuál es “{ex.word}”?</Instruction>
      <div className="mb-5 flex items-center gap-3">
        <SpeakerButton text={ex.word} />
        <EnglishText>{ex.word}</EnglishText>
      </div>
      <div role="radiogroup" className="grid grid-cols-2 gap-3">
        {ex.options.map((o, i) => {
          const isSel = sel === i
          const showOk = locked && verdict === 'wrong' && i === ex.correct
          const good = locked && isSel && verdict === 'correct'
          const bad = locked && isSel && verdict === 'wrong'
          let cls = 'border-go-border bg-white'
          if (good || showOk) cls = 'border-go-primary bg-go-primary-tint'
          else if (bad) cls = 'border-go-danger bg-go-danger-tint'
          else if (isSel) cls = 'border-go-primary bg-go-primary-tint'
          return (
            <button key={i} type="button" role="radio" aria-checked={isSel} aria-label={o.label} disabled={locked}
              onClick={() => { sfx.tap(); setSel(i); onAnswer(i) }}
              className={`relative flex min-h-[132px] flex-col items-center justify-center gap-1 rounded-go border-2 border-b-4 p-3 transition-transform active:translate-y-[2px] ${cls}`}>
              <span className="text-[56px] leading-none" aria-hidden>{o.emoji}</span>
              <span lang="en" className="font-display text-[16px] font-bold text-go-text">{o.label}</span>
              {(good || showOk) && <span className="absolute right-2 top-2 text-go-primary" aria-hidden><CheckIcon size={18} /></span>}
              {bad && <span className="absolute right-2 top-2 text-go-danger" aria-hidden><CrossIcon size={18} /></span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
