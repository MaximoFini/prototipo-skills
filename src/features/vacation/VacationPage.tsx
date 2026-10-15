import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Gift, MapPin, Share2, X } from 'lucide-react'
import { Button, CheckIcon, FlameIcon, Modal, ProgressBar, ScreenHeader, Skilly } from '@/design'
import { useApp } from '@/store/useApp'
import { addDays, now, today } from '@/domain/clock'
import { CHALLENGE_DAYS, MILESTONE_DAYS, REWARDS, type Reward } from '@/data/rewards'
import { burst } from '@/lib/confetti'
import { sfx } from '@/lib/sfx'
import { RewardIcon } from './RewardIcon'
import { ShareCard } from './ShareCard'
import { computeChallenge, isOwned, nextMilestone, rewardCode } from './vacationLogic'

export function fmtDay(key: string): string {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })
}

export default function VacationPage() {
  const nav = useNavigate()
  const vacation = useApp((s) => s.vacation)
  const streak = useApp((s) => s.streak)
  const name = useApp((s) => s.profile.name)
  const patch = useApp((s) => s.patch)
  const [shareOpen, setShareOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const todayKey = today()
  const info = useMemo(
    () => (vacation.joined && vacation.startDay ? computeChallenge(streak.days, vacation.startDay, todayKey) : null),
    [vacation.joined, vacation.startDay, streak.days, todayKey],
  )

  const flash = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2200)
  }
  const join = () => {
    sfx.streak()
    burst()
    patch((s) => ({ vacation: { ...s.vacation, joined: true, startDay: today() } }))
  }
  const restart = () => {
    sfx.tap()
    patch((s) => ({ vacation: { ...s.vacation, joined: true, startDay: today() } }))
  }
  const claim = (r: Reward) => {
    if (isOwned(vacation.ownedRewards, r.id)) return
    sfx.gem()
    burst()
    patch((s) => ({
      vacation: { ...s.vacation, ownedRewards: [...s.vacation.ownedRewards, { rewardId: r.id, code: rewardCode(r.id, s.profile.name), claimedAt: now(), redeemed: false }] },
    }))
  }

  const progress = info?.progress ?? 0
  const next = nextMilestone(progress)
  const startLabel = vacation.startDay ? fmtDay(vacation.startDay) : fmtDay(todayKey)
  const endLabel = fmtDay(vacation.startDay ? addDays(vacation.startDay, CHALLENGE_DAYS - 1) : addDays(todayKey, CHALLENGE_DAYS - 1))

  return (
    <div className="flex h-full flex-col bg-white">
      <ScreenHeader title="Desafío de Vacaciones" back="/" />
      <div className="scroll-y flex-1 pb-8">
        {/* Hero */}
        <section className="relative overflow-hidden bg-go-primary px-5 pb-6 pt-5 text-center text-white">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" aria-hidden />
          <div className="relative inline-block bg-go-danger px-3 py-1 font-display text-[12px] font-extrabold uppercase tracking-[0.1em]">Desafío de Vacaciones</div>
          <div className="relative mt-2 flex justify-center">
            <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}>
              <Skilly mood={info?.broken ? 'sad' : info?.finished ? 'cheer' : 'wink'} size={92} />
            </motion.div>
          </div>
          <h2 className="relative font-display text-[28px] font-extrabold leading-tight">21 días de racha</h2>
          <p className="relative mt-1 text-[15px] text-white/90">Tu inglés no se toma vacaciones. Practicá todos los días y ganá premios de verdad en la academia.</p>
        </section>

        {!info && (
          <section className="px-4 pt-5">
            <h3 className="font-display text-[20px] font-extrabold text-go-text">Qué ganás</h3>
            <div className="mt-3 flex flex-col gap-3">
              {REWARDS.map((r) => (
                <div key={r.id} className="card-go flex items-center gap-3 p-3">
                  <RewardIcon icon={r.icon} />
                  <div className="min-w-0 flex-1">
                    <div className="font-display text-[16px] font-extrabold leading-tight text-go-text">{r.title}</div>
                    <div className="text-[13px] text-go-muted">{r.description}</div>
                  </div>
                  <span className="shrink-0 rounded-full bg-go-surface px-2.5 py-1 font-display text-[12px] font-extrabold text-go-text">Día {r.day}</span>
                </div>
              ))}
            </div>
            <Button block onClick={join} className="mt-5">Unirme al desafío</Button>
            <Rules start={startLabel} end={endLabel} />
          </section>
        )}

        {info && (
          <section className="px-4 pt-5">
            {/* Progreso */}
            <div className="flex items-end justify-between">
              <div>
                <div className="font-display text-[30px] font-extrabold leading-none text-go-primary">Día {info.finished ? CHALLENGE_DAYS : Math.max(1, info.dayNumber)}<span className="text-[18px] text-go-muted"> de {CHALLENGE_DAYS}</span></div>
                <div className="mt-1 text-[14px] text-go-muted">{info.progress} {info.progress === 1 ? 'día seguido' : 'días seguidos'} · {startLabel} al {endLabel}</div>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-go-surface px-3 py-1.5 font-display text-[16px] font-extrabold text-go-streak"><FlameIcon size={22} /> {streak.count}</div>
            </div>
            <ProgressBar className="mt-3" value={(progress / CHALLENGE_DAYS) * 100} height={16} />
            <p className="mt-2 text-[14px] text-go-text">
              {info.finished
                ? '¡Completaste el desafío! Sos una máquina.'
                : info.broken || info.expired
                  ? ''
                  : info.practicedToday
                    ? '¡Hoy ya sumaste! Volvé mañana para el día ' + Math.min(CHALLENGE_DAYS, progress + 1) + '.'
                    : 'Hoy todavía no practicaste. Una lección y sumás el día.'}
              {next && !info.broken && !info.finished && !info.expired ? <> Faltan <b>{next.remaining}</b> {next.remaining === 1 ? 'día' : 'días'} para el próximo premio.</> : null}
            </p>

            {(info.broken || info.expired) && (
              <div className="card-go mt-3 border-go-danger bg-go-danger-tint p-4" role="alert">
                <div className="flex items-start gap-3">
                  <Skilly mood="sad" size={44} />
                  <div className="flex-1">
                    <div className="font-display text-[17px] font-extrabold text-go-danger">{info.expired ? 'Terminó el plazo del desafío' : `Se cortó la racha en el día ${info.brokenAt}`}</div>
                    <p className="text-[14px] text-go-text">{progress > 0 ? `Llegaste a ${progress} días y los premios ganados siguen tuyos. ` : ''}¿Arrancamos de nuevo? Hoy es un gran día.</p>
                  </div>
                </div>
                <Button variant="danger" block onClick={restart} className="mt-3">Reiniciar desafío</Button>
              </div>
            )}

            {/* Calendario */}
            <h3 className="mt-5 font-display text-[20px] font-extrabold text-go-text">Tu calendario</h3>
            <div className="mt-3 grid grid-cols-7 gap-2" role="list" aria-label="Calendario del desafío">
              {info.cells.map((c) => {
                const milestone = (MILESTONE_DAYS as readonly number[]).includes(c.day)
                const base = 'relative grid aspect-square place-items-center rounded-full font-display text-[15px] font-extrabold'
                const cls =
                  c.status === 'done' ? `bg-go-primary text-white ${c.isToday ? 'ring-4 ring-go-xp/60' : ''}`
                  : c.status === 'today' ? 'border-[3px] border-go-primary bg-go-primary-tint text-go-primary ring-4 ring-go-xp/60'
                  : c.status === 'missed' ? 'border-2 border-go-danger/40 bg-go-danger-tint text-go-danger'
                  : 'bg-go-surface text-go-muted'
                const label = `Día ${c.day}: ${c.status === 'done' ? 'hecho' : c.status === 'today' ? 'hoy' : c.status === 'missed' ? 'salteado' : 'pendiente'}`
                return (
                  <div key={c.day} role="listitem" aria-label={label} className={`${base} ${cls}`}>
                    {c.status === 'done' ? <CheckIcon size={22} /> : c.status === 'missed' ? <X size={18} strokeWidth={3} aria-hidden /> : c.day}
                    {milestone && <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-go-xp text-go-text shadow"><Gift size={12} strokeWidth={3} aria-hidden /></span>}
                  </div>
                )
              })}
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-go-muted">
              <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-go-primary" /> Hecho</span>
              <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full border-2 border-go-primary bg-go-primary-tint" /> Hoy</span>
              <span className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-go-surface border border-go-border" /> Pendiente</span>
              <span className="flex items-center gap-1"><Gift size={12} /> Premio</span>
            </div>

            {/* Premios */}
            <h3 className="mt-6 font-display text-[20px] font-extrabold text-go-text">Premios</h3>
            <div className="mt-3 flex flex-col gap-3">
              {REWARDS.map((r) => {
                const owned = vacation.ownedRewards.find((o) => o.rewardId === r.id)
                const reached = progress >= r.day
                const left = r.day - progress
                return (
                  <div key={r.id} className={`card-go flex items-center gap-3 p-3 ${reached && !owned ? 'border-go-xp-dark bg-go-xp/10' : ''}`}>
                    <RewardIcon icon={r.icon} tone={owned ? 'green' : reached ? 'gold' : 'gray'} />
                    <div className="min-w-0 flex-1">
                      <div className="font-display text-[12px] font-extrabold uppercase tracking-wider text-go-muted">Día {r.day}</div>
                      <div className="font-display text-[16px] font-extrabold leading-tight text-go-text">{r.title}</div>
                      <div className="text-[13px] text-go-muted">
                        {owned ? <>Tu código: <b className="text-go-text">{owned.code}</b>{owned.redeemed ? ' · canjeado' : ''}</> : reached ? '¡Es tuyo! Reclamalo ahora.' : `Faltan ${left} ${left === 1 ? 'día' : 'días'}`}
                      </div>
                    </div>
                    {owned ? (
                      <button type="button" onClick={() => nav('/profile/rewards')} className="shrink-0 rounded-full bg-go-primary-tint px-3 py-2 font-display text-[12px] font-extrabold uppercase text-go-primary">Ver</button>
                    ) : reached ? (
                      <Button variant="xp" className="shrink-0 !px-3 !py-2 !text-[13px]" onClick={() => claim(r)}>Reclamar</Button>
                    ) : null}
                  </div>
                )
              })}
            </div>
            {vacation.ownedRewards.some((o) => !o.redeemed) && (
              <p className="mt-3 flex items-start gap-2 rounded-go bg-go-surface p-3 text-[14px] text-go-text">
                <MapPin size={18} className="mt-0.5 shrink-0 text-go-danger" aria-hidden />
                <span>Mostrá tu código en la academia (<b>Av. Elías Yofre 1079</b>, Barrio Jardín).</span>
              </p>
            )}

            <Button variant="secondary" block className="mt-5" onClick={() => setShareOpen(true)}><Share2 size={20} aria-hidden /> Compartir mi progreso</Button>
            <Rules start={startLabel} end={endLabel} />
          </section>
        )}
      </div>

      <Modal open={shareOpen} onClose={() => setShareOpen(false)}>
        <div className="flex items-center justify-between">
          <h3 className="font-display text-[20px] font-extrabold text-go-text">Compartí tu progreso</h3>
          <button type="button" onClick={() => setShareOpen(false)} aria-label="Cerrar" className="grid h-10 w-10 place-items-center rounded-full text-go-muted active:bg-go-surface"><X size={24} /></button>
        </div>
        <p className="mb-3 text-[14px] text-go-muted">Así se ve en tus historias de Instagram o en tus estados de WhatsApp.</p>
        <ShareCard name={name || 'Vos'} progress={progress} streak={streak.count} />
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Button variant="secondary" onClick={() => flash('Demo: acá se abriría Instagram')}>Instagram</Button>
          <Button onClick={() => flash('Demo: acá se abriría el menú de compartir')}>Compartir</Button>
        </div>
        {toast && <p role="status" className="mt-3 rounded-go bg-go-primary-tint p-2 text-center text-[14px] font-bold text-go-primary">{toast}</p>}
      </Modal>
    </div>
  )
}

function Rules({ start, end }: { start: string; end: string }) {
  return (
    <div className="mt-6 rounded-go bg-go-surface p-4">
      <h3 className="font-display text-[17px] font-extrabold text-go-text">Reglas</h3>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-[14px] text-go-text">
        <li>Duración: <b>21 días</b>, del {start} al {end}.</li>
        <li>Cada día tenés que completar al menos <b>1 lección</b> (o una práctica).</li>
        <li>Si te salteás un día, la racha del desafío se corta. Los premios que ya ganaste son tuyos.</li>
        <li>Premios en los días <b>7</b>, <b>14</b> y <b>21</b>. Se canjean <b>en la academia</b> mostrando tu código.</li>
      </ul>
      <p className="mt-2 text-[12px] text-go-muted">Sujeto a disponibilidad. Un premio por alumno. Prototipo: los premios son de demostración.</p>
    </div>
  )
}
