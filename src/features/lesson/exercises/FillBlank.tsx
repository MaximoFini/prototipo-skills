import { useState } from 'react'
import type { FillBlank as T } from '@/domain/types'
import { ChoiceList, Instruction, SpeakerButton, type ExerciseProps } from './shared'

export function FillBlankExercise({ ex, locked, verdict, onAnswer }: ExerciseProps<T>) {
  const [sel, setSel] = useState<number | null>(null)
  const [before, after = ''] = ex.sentence.split('___')
  const filled = sel !== null ? ex.options[sel] : null
  const full = ex.sentence.replace('___', ex.options[ex.correct])
  const slotCls = verdict === 'correct' ? 'border-go-primary text-go-primary' : verdict === 'wrong' ? 'border-go-danger text-go-danger' : 'border-go-primary text-go-primary'
  return (
    <div>
      <Instruction>Completá la frase</Instruction>
      <div className="mb-2 flex items-start gap-3">
        <SpeakerButton text={full} />
        <p lang="en" className="font-display text-[24px] font-semibold leading-[44px] text-go-text">
          {before}
          <span className={`mx-1 inline-block min-w-[72px] border-b-4 px-2 text-center align-baseline ${filled ? slotCls : 'border-go-border text-transparent'}`}>
            {filled ?? '___'}
          </span>
          {after}
        </p>
      </div>
      {ex.translation && <p className="mb-5 pl-14 text-[15px] text-go-muted">{ex.translation}</p>}
      <div className="mt-5">
        <ChoiceList options={ex.options} selected={sel} locked={locked} verdict={verdict} correct={ex.correct} lang="en"
          onSelect={(i) => { setSel(i); onAnswer(i) }} />
      </div>
    </div>
  )
}
