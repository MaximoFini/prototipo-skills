import { useEffect, useRef, useState } from 'react'
import type { TypeTranslation as T } from '@/domain/types'
import { EnglishText, Instruction, SpeakerButton, type ExerciseProps, type Verdict } from './shared'

/** Campo de texto reutilizable (escribir traducción / escuchar y escribir). */
export function TextAnswer({ value, onChange, locked, verdict, lang, placeholder }: {
  value: string; onChange: (v: string) => void; locked: boolean; verdict: Verdict; lang: 'en' | 'es'; placeholder: string
}) {
  const ref = useRef<HTMLTextAreaElement>(null)
  useEffect(() => { const t = setTimeout(() => ref.current?.focus(), 250); return () => clearTimeout(t) }, [])
  const border = verdict === 'correct' ? 'border-go-primary bg-go-primary-tint' : verdict === 'wrong' ? 'border-go-danger bg-go-danger-tint' : 'border-go-border bg-white focus:border-go-primary'
  return (
    <textarea ref={ref} rows={3} value={value} disabled={locked} lang={lang} aria-label="Tu respuesta" placeholder={placeholder}
      autoCapitalize="off" autoCorrect="off" autoComplete="off" spellCheck={false}
      onChange={(e) => onChange(e.target.value.replace(/\n/g, ' '))}
      onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault() }}
      className={`w-full resize-none rounded-go border-2 p-4 text-[18px] leading-7 text-go-text outline-none placeholder:text-go-muted ${border}`} />
  )
}

export function TypeTranslationExercise({ ex, locked, verdict, onAnswer }: ExerciseProps<T>) {
  const [text, setText] = useState('')
  const en = ex.promptLang === 'en'
  return (
    <div>
      <Instruction>{en ? 'Escribilo en español' : 'Escribilo en inglés'}</Instruction>
      <div className="mb-5 flex items-center gap-3">
        {en && <SpeakerButton text={ex.prompt} />}
        {en ? <EnglishText>{ex.prompt}</EnglishText> : <p className="font-display text-[24px] font-semibold leading-8">{ex.prompt}</p>}
      </div>
      <TextAnswer value={text} locked={locked} verdict={verdict} lang={en ? 'es' : 'en'} placeholder={en ? 'Escribilo en español' : 'Escribilo en inglés'}
        onChange={(v) => { setText(v); onAnswer(v.trim() ? v : null) }} />
    </div>
  )
}
