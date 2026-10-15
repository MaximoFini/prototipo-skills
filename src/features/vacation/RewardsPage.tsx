import { useNavigate } from 'react-router-dom'
import { CheckCircle2, MapPin } from 'lucide-react'
import { Button, ScreenHeader, Skilly } from '@/design'
import { useApp } from '@/store/useApp'
import { getReward } from '@/data/rewards'
import { sfx } from '@/lib/sfx'
import { QrGlyph } from './QrGlyph'
import { RewardIcon } from './RewardIcon'

export default function RewardsPage() {
  const nav = useNavigate()
  const owned = useApp((s) => s.vacation.ownedRewards)
  const patch = useApp((s) => s.patch)

  const redeem = (rewardId: string) => {
    sfx.correct()
    patch((s) => ({ vacation: { ...s.vacation, ownedRewards: s.vacation.ownedRewards.map((o) => (o.rewardId === rewardId ? { ...o, redeemed: true } : o)) } }))
  }

  return (
    <div className="flex h-full flex-col bg-white">
      <ScreenHeader title="Mis premios" back="/profile" />
      {owned.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
          <Skilly mood="think" size={100} />
          <h2 className="font-display text-[22px] font-extrabold text-go-text">Todavía no tenés premios</h2>
          <p className="max-w-[280px] text-[15px] text-go-muted">Sumate al Desafío de Vacaciones: con 7, 14 y 21 días de racha ganás premios de verdad en la academia.</p>
          <Button onClick={() => nav('/vacation')} className="mt-2">Ir al desafío</Button>
        </div>
      ) : (
        <div className="scroll-y flex-1 px-4 pb-8 pt-4">
          <p className="mb-3 flex items-start gap-2 rounded-go bg-go-surface p-3 text-[14px] text-go-text">
            <MapPin size={18} className="mt-0.5 shrink-0 text-go-danger" aria-hidden />
            <span>Mostrá el código en recepción de la academia (<b>Av. Elías Yofre 1079</b>).</span>
          </p>
          <div className="flex flex-col gap-4">
            {owned.map((o) => {
              const r = getReward(o.rewardId)
              return (
                <article key={o.code + o.rewardId} className={`card-go overflow-hidden ${o.redeemed ? 'opacity-80' : ''}`}>
                  <div className="flex items-center gap-3 p-3">
                    <RewardIcon icon={r?.icon ?? 'ticket'} tone={o.redeemed ? 'gray' : 'green'} />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display text-[17px] font-extrabold leading-tight text-go-text">{r?.title ?? 'Premio Skills'}</h3>
                      <span className={`mt-1 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-display text-[12px] font-extrabold uppercase tracking-wide ${o.redeemed ? 'bg-go-surface text-go-muted' : 'bg-go-xp text-go-text'}`}>
                        {o.redeemed && <CheckCircle2 size={14} aria-hidden />}
                        {o.redeemed ? 'Canjeado' : 'Para canjear'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 border-t-2 border-dashed border-go-border bg-go-surface/60 p-4">
                    <div className="rounded-xl border-2 border-go-border bg-white p-1.5"><QrGlyph code={o.code} size={104} dim={o.redeemed} /></div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[12px] font-bold uppercase tracking-wider text-go-muted">Tu código</div>
                      <div className={`font-display text-[26px] font-extrabold tracking-wider ${o.redeemed ? 'text-go-muted line-through' : 'text-go-text'}`}>{o.code}</div>
                      <div className="text-[13px] text-go-muted">{o.redeemed ? 'Ya lo usaste. ¡Disfrutalo!' : 'Mostrá este código en recepción.'}</div>
                    </div>
                  </div>
                  {!o.redeemed && (
                    <div className="p-3 pt-0">
                      <Button variant="secondary" block onClick={() => redeem(o.rewardId)} className="mt-3 !py-2.5 !text-[13px]">Marcar como canjeado (demo)</Button>
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
