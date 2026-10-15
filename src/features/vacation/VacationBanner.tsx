import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { ProgressBar, Skilly } from '@/design'
import { useApp } from '@/store/useApp'
import { today } from '@/domain/clock'
import { CHALLENGE_DAYS } from '@/data/rewards'
import { computeChallenge, nextMilestone } from './vacationLogic'

/** Banner del Desafío de Vacaciones para la pantalla Aprender. Compacto (≤ 84 px). */
export function VacationBanner() {
  const nav = useNavigate()
  const vacation = useApp((s) => s.vacation)
  const days = useApp((s) => s.streak.days)

  if (!vacation.joined || !vacation.startDay) {
    return (
      <button type="button" onClick={() => nav('/vacation')} className="relative flex h-[76px] w-full items-center gap-3 overflow-hidden rounded-go border-b-4 border-go-danger-dark bg-go-danger px-4 text-left text-white active:translate-y-[2px]" aria-label="Sumate al Desafío de Vacaciones: 21 días igual a premios">
        <Skilly mood="wink" size={44} className="shrink-0" />
        <span className="min-w-0 flex-1">
          <span className="block font-display text-[16px] font-extrabold leading-tight">¡Sumate al Desafío de Vacaciones!</span>
          <span className="block text-[13px] font-medium text-white/90">21 días = premios en la academia</span>
        </span>
        <ChevronRight size={24} strokeWidth={3} aria-hidden className="shrink-0" />
      </button>
    )
  }

  const info = computeChallenge(days, vacation.startDay, today())
  const next = nextMilestone(info.progress)
  const dayNum = info.finished ? CHALLENGE_DAYS : Math.max(1, info.dayNumber)
  const sub = info.finished
    ? '¡Desafío completado!'
    : info.broken
      ? 'Se cortó la racha. ¡Reiniciá el desafío!'
      : next
        ? `Próximo premio en ${next.remaining} ${next.remaining === 1 ? 'día' : 'días'}`
        : '¡Premios listos para reclamar!'
  return (
    <button type="button" onClick={() => nav('/vacation')} className="flex h-[72px] w-full items-center gap-3 rounded-go border-b-4 border-go-primary-dark bg-go-primary px-4 text-left text-white active:translate-y-[2px]" aria-label={`Desafío de Vacaciones, día ${dayNum} de ${CHALLENGE_DAYS}`}>
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between">
          <span className="font-display text-[17px] font-extrabold leading-tight">Día {dayNum} de {CHALLENGE_DAYS}</span>
          <span className="text-[12px] font-medium text-white/85">{sub}</span>
        </span>
        <ProgressBar className="mt-1.5 !bg-white/25" value={(info.progress / CHALLENGE_DAYS) * 100} height={12} color="#F2C94C" />
      </span>
      <ChevronRight size={22} strokeWidth={3} aria-hidden className="shrink-0" />
    </button>
  )
}
