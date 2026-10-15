import { useState } from 'react'
import type { ChooseTranslation as T } from '@/domain/types'
import { ChoiceList, EnglishText, Instruction, SpeakerButton, type ExerciseProps } from './shared'

export function ChooseTranslationExercise({ ex, locked, verdict, onAnswer }: ExerciseProps<T>) {
  const [sel, setSel] = useState<number | null>(null)
  const en = ex.promptLang === 'en'
  return (
    <div>
      <Instruction>{en ? '¿Cómo se dice en español?' : '¿Cómo se dice en inglés?'}</Instruction>
      <div className="mb-6 flex items-center gap-3">
        {en && <SpeakerButton text={ex.prompt} />}
        {en ? <EnglishText>{ex.prompt}</EnglishText> : <p className="font-display text-[24px] font-semibold leading-8">{ex.prompt}</p>}
      </div>
      <ChoiceList options={ex.options} selected={sel} locked={locked} verdict={verdict} correct={ex.correct} lang={en ? 'es' : 'en'}
        onSelect={(i) => { setSel(i); onAnswer(i) }} />
    </div>
  )
}
