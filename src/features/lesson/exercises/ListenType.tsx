import { useEffect, useState } from 'react'
import type { ListenType as T } from '@/domain/types'
import { speak, ttsAvailable } from '@/lib/tts'
import { Instruction, ListenControls, type ExerciseProps } from './shared'
import { TextAnswer } from './TypeTranslation'

export function ListenTypeExercise({ ex, locked, verdict, onAnswer, onSkip }: ExerciseProps<T>) {
  const [text, setText] = useState('')
  useEffect(() => { if (ttsAvailable()) speak(ex.audio) }, [ex.audio])
  return (
    <div>
      <Instruction>Escribí lo que escuchás</Instruction>
      <div className="mb-6"><ListenControls text={ex.audio} /></div>
      <TextAnswer value={text} locked={locked} verdict={verdict} lang="en" placeholder="Escribilo en inglés"
        onChange={(v) => { setText(v); onAnswer(v.trim() ? v : null) }} />
      {!locked && (
        <button type="button" onClick={onSkip} className="mx-auto mt-5 block min-h-[44px] px-3 font-display text-[14px] font-bold uppercase tracking-wider text-go-muted underline-offset-4 hover:underline">
          No puedo escuchar ahora
        </button>
      )}
    </div>
  )
}
