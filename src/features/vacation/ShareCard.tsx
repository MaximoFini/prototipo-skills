import { FlameIcon } from '@/design'
import { ShieldMark } from '@/design'
import { CHALLENGE_DAYS } from '@/data/rewards'

/** Tarjeta vertical estilo story de Instagram con el progreso del desafío. */
export function ShareCard({ name, progress, streak }: { name: string; progress: number; streak: number }) {
  return (
    <div
      className="relative mx-auto flex flex-col items-center overflow-hidden text-center text-white"
      style={{ width: 232, height: 392, borderRadius: 24, background: 'linear-gradient(170deg,#00693A 0%,#00522E 55%,#003B20 100%)', boxShadow: '0 8px 24px rgba(0,0,0,.25)' }}
    >
      <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10" />
      <div className="absolute -bottom-14 -left-10 h-44 w-44 rounded-full bg-white/10" />
      <div className="relative mt-4 bg-go-danger px-3 py-1 font-display text-[10px] font-extrabold uppercase tracking-[0.12em]">Desafío de Vacaciones</div>
      <div className="relative mt-3"><ShieldMark size={60} /></div>
      <div className="relative mt-2 font-display text-[13px] font-bold text-white/85">{name} lleva</div>
      <div className="relative font-display text-[64px] font-extrabold leading-none">{progress}</div>
      <div className="relative font-display text-[15px] font-extrabold uppercase tracking-wider">de {CHALLENGE_DAYS} días</div>
      <div className="relative mt-3 flex flex-wrap justify-center gap-[5px] px-6" aria-hidden>
        {Array.from({ length: CHALLENGE_DAYS }, (_, i) => (
          <span key={i} className={`h-[14px] w-[14px] rounded-full ${i < progress ? 'bg-go-xp' : 'bg-white/25'}`} />
        ))}
      </div>
      <div className="relative mt-3 flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 font-display text-[15px] font-extrabold">
        <FlameIcon size={20} /> {streak} días de racha
      </div>
      <div className="relative mt-auto mb-4">
        <div className="font-display text-[18px] font-extrabold">#SkillsGo</div>
        <div className="text-[11px] italic text-white/80">Tu inglés no se toma vacaciones</div>
      </div>
    </div>
  )
}
