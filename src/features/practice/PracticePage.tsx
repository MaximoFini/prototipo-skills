import { useNavigate } from 'react-router-dom'
import { BookOpen, Dumbbell } from 'lucide-react'
import { Button, HeartIcon, ScreenHeader, Skilly } from '@/design'
import { useApp } from '@/store/useApp'
import { HEARTS_MAX, PRACTICE_EXERCISES } from '@/domain/rules'
import { dayKey } from '@/domain/clock'

const TIPS = [
  'Los errores son la forma más rápida de aprender. ¡Por eso los guardo para vos!',
  'Cinco minutos por día valen más que una hora el domingo.',
  'Decí las frases en voz alta. Si hacés el ridículo, mejor: se te queda.',
  'Una palabra nueva por día son 365 al año. Hacé la cuenta.',
  'Si te trabaste, escuchá el audio en modo lento.',
]

export default function PracticePage() {
  const nav = useNavigate()
  const mistakes = useApp((s) => s.mistakes.length)
  const words = useApp((s) => s.vocabulary.length)
  const hearts = useApp((s) => s.hearts)
  const tip = TIPS[Number(dayKey().slice(-2)) % TIPS.length]
  const heal = hearts < HEARTS_MAX

  return (
    <div className="flex h-full flex-col bg-white">
      <ScreenHeader title="Práctica" back="/" />
      <div className="scroll-y flex-1 space-y-4 px-4 pb-8 pt-4">
        <div className="flex items-end gap-3">
          <Skilly mood="think" size={64} />
          <div className="relative flex-1 rounded-go border-2 border-go-border bg-white p-3 text-[14px] text-go-text">
            <span className="absolute -left-2 bottom-4 h-3 w-3 rotate-45 border-b-2 border-l-2 border-go-border bg-white" aria-hidden />
            {tip}
          </div>
        </div>

        <section className="card-go p-4">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-go-danger-tint text-go-danger"><Dumbbell size={26} strokeWidth={2.5} aria-hidden /></span>
            <div className="flex-1">
              <h2 className="font-display text-[19px] font-extrabold leading-tight text-go-text">Practicá tus errores</h2>
              <p className="text-[14px] text-go-muted">
                {mistakes > 0 ? <><b className="text-go-text">{mistakes}</b> {mistakes === 1 ? 'error guardado' : 'errores guardados'}</> : 'Todavía no tenés errores. ¡Qué crack!'}
              </p>
            </div>
          </div>
          <p className="mt-3 text-[14px] text-go-text">
            {mistakes > 0 ? `Repasá hasta ${PRACTICE_EXERCISES} ejercicios que te costaron. Ganás XP y no gastás corazones.` : `Igual podés repasar ${PRACTICE_EXERCISES} ejercicios de lo que ya hiciste y ganar XP.`}
          </p>
          {heal && (
            <p className="mt-2 flex items-center gap-1.5 rounded-xl bg-go-danger-tint px-3 py-2 text-[14px] font-bold text-go-danger">
              <HeartIcon size={20} /> +1 corazón al terminar
            </p>
          )}
          <Button block className="mt-3" onClick={() => nav('/practice/session')}>Empezar</Button>
        </section>

        <section className="card-go p-4">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-go-primary-tint text-go-primary"><BookOpen size={26} strokeWidth={2.5} aria-hidden /></span>
            <div className="flex-1">
              <h2 className="font-display text-[19px] font-extrabold leading-tight text-go-text">Vocabulario</h2>
              <p className="text-[14px] text-go-muted">{words > 0 ? <><b className="text-go-text">{words}</b> {words === 1 ? 'palabra aprendida' : 'palabras aprendidas'}</> : 'Todavía no aprendiste palabras.'}</p>
            </div>
          </div>
          <Button variant="secondary" block className="mt-3" onClick={() => nav('/practice/vocabulary')}>Ver palabras</Button>
        </section>
      </div>
    </div>
  )
}
