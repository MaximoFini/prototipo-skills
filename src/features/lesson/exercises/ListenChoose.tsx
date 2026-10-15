import { useEffect, useState } from 'react'
import type { ListenChoose as T } from '@/domain/types'
import { speak, ttsAvailable } from '@/lib/tts'
import { ChoiceList, Instruction, ListenControls, type ExerciseProps } from './shared'

export function ListenChooseExercise({ ex, locked, verdict, onAnswer, onSkip }: ExerciseProps<T>) {
  const [sel, setSel] = useState<number | null>(null)
  useEffect(() => { if (ttsAvailable()) speak(ex.audio) }, [ex.audio])
  return (
    <div>
      <Instruction>¿Qué escuchaste?</Instruction>
      <div className="mb-6"><ListenControls text={ex.audio} /></div>
      <ChoiceList options={ex.options} selected={sel} locked={locked} verdict={verdict} correct={ex.correct}
        onSelect={(i) => { setSel(i); onAnswer(i) }} />
      {!locked && (
        <button type="button" onClick={onSkip} className="mx-auto mt-5 block min-h-[44px] px-3 font-display text-[14px] font-bold uppercase tracking-wider text-go-muted underline-offset-4 hover:underline">
          No puedo escuchar ahora
        </button>
      )}
    </div>
  )
}
