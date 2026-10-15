import { useEffect, useRef, useState } from 'react'
import { Mic } from 'lucide-react'
import type { Speak as T } from '@/domain/types'
import { CheckIcon } from '@/design'
import { sfx } from '@/lib/sfx'
import { EnglishText, Instruction, SpeakerButton, type ExerciseProps } from './shared'

type Phase = 'idle' | 'listening' | 'heard'

export function SpeakExercise({ ex, locked, onAnswer, onSkip }: ExerciseProps<T>) {
  const [phase, setPhase] = useState<Phase>('idle')
  const timer = useRef<ReturnType<typeof setTimeout>>()
  useEffect(() => () => clearTimeout(timer.current), [])
  const start = () => {
    if (phase !== 'idle' || locked) return
    sfx.tap()
    setPhase('listening')
    timer.current = setTimeout(() => { setPhase('heard'); onAnswer(true) }, 1500)
  }
  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-2">
        <Instruction>Decí esta frase</Instruction>
        <span className="-mt-4 rounded-full bg-go-xp px-2.5 py-0.5 font-display text-[11px] font-extrabold uppercase tracking-wider text-go-text">demo</span>
      </div>
      <div className="mb-8 flex items-start gap-3">
        <SpeakerButton text={ex.phrase} />
        <div>
          <EnglishText>{ex.phrase}</EnglishText>
          <p className="mt-1 text-[15px] text-go-muted">{ex.translation}</p>
        </div>
      </div>
      <div className="flex flex-col items-center gap-3" aria-live="polite">
        <button type="button" onClick={start} disabled={phase !== 'idle' || locked}
          aria-label={phase === 'idle' ? 'Tocá para hablar' : phase === 'listening' ? 'Escuchando' : 'Listo'}
          className={`relative grid h-28 w-28 place-items-center rounded-full border-b-4 text-white transition-transform active:translate-y-[3px] ${phase === 'heard' ? 'border-go-primary-dark bg-go-primary' : 'border-go-primary-dark bg-go-primary'}`}>
          {phase === 'listening' && <span className="absolute inset-0 animate-ping rounded-full bg-go-primary/40" aria-hidden />}
          {phase === 'heard' ? <CheckIcon size={44} /> : <Mic size={46} aria-hidden />}
        </button>
        <p className="font-display text-[15px] font-bold text-go-muted">
          {phase === 'idle' && 'Tocá y hablá'}
          {phase === 'listening' && 'Escuchando…'}
          {phase === 'heard' && '¡Te escuchamos!'}
        </p>
        <p className="max-w-[260px] text-center text-[12px] text-go-muted">Demo: en la versión final reconocemos tu pronunciación de verdad.</p>
      </div>
      {!locked && (
        <button type="button" onClick={onSkip} className="mx-auto mt-4 block min-h-[44px] px-3 font-display text-[14px] font-bold uppercase tracking-wider text-go-muted underline-offset-4 hover:underline">
          Omitir
        </button>
      )}
    </div>
  )
}
