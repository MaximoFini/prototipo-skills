import { useEffect, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Snowflake } from 'lucide-react'
import { BoltIcon, Button, GemChip, GemIcon, HeartIcon, Modal, ScreenHeader, Skilly } from '@/design'
import type { SkillyMood } from '@/design'
import { useApp } from '@/store/useApp'
import { now } from '@/domain/clock'
import { DOUBLE_XP_COST, FREEZE_COST, HEARTS_MAX, REFILL_COST, formatCountdown } from '@/domain/rules'
import { sfx } from '@/lib/sfx'

type ItemId = 'hearts' | 'freeze' | 'double'
const MAX_FREEZES = 2

interface Item {
  id: ItemId
  title: string
  desc: string
  price: number
  icon: ReactNode
  /** Motivo por el que no se puede comprar (aparte de las gemas). */
  blocked?: string
  extra?: string
}

export default function ShopPage() {
  const gems = useApp((s) => s.gems)
  const hearts = useApp((s) => s.hearts)
  const freezes = useApp((s) => s.streak.freezes)
  const doubleUntil = useApp((s) => s.doubleXpUntil)
  const [, tick] = useState(0)
  const [confirm, setConfirm] = useState<ItemId | null>(null)
  const [toast, setToast] = useState<{ text: string; ok: boolean } | null>(null)
  const [mood, setMood] = useState<SkillyMood>('wink')

  useEffect(() => { const i = setInterval(() => tick((n) => n + 1), 1000); return () => clearInterval(i) }, [])
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3200)
    return () => clearTimeout(t)
  }, [toast])

  const doubleLeft = Math.max(0, doubleUntil - now())
  const items: Item[] = [
    {
      id: 'hearts', title: 'Recargar corazones', price: REFILL_COST, icon: <HeartIcon size={44} />,
      desc: 'Volvé a tener las 5 vidas al toque.',
      blocked: hearts >= HEARTS_MAX ? '¡Ya tenés los corazones llenos!' : undefined,
      extra: `Tenés ${hearts}/${HEARTS_MAX}`,
    },
    {
      id: 'freeze', title: 'Congelar racha', price: FREEZE_COST, icon: <Snowflake size={40} strokeWidth={2.6} color="#1F5FA8" aria-hidden />,
      desc: 'Cubre 1 día sin práctica y salva tu racha.',
      blocked: freezes >= MAX_FREEZES ? 'Ya tenés el máximo (2).' : undefined,
      extra: `Tenés ${freezes}/${MAX_FREEZES}`,
    },
    {
      id: 'double', title: 'Doble XP por 15 min', price: DOUBLE_XP_COST, icon: <BoltIcon size={44} />,
      desc: 'Todo el XP de tus lecciones vale el doble.',
      extra: doubleLeft > 0 ? `Activo: ${formatCountdown(doubleLeft)}` : undefined,
    },
  ]
  const current = items.find((i) => i.id === confirm)

  const buy = (it: Item) => {
    const st = useApp.getState()
    const ok = it.id === 'hearts' ? st.refillHearts() : it.id === 'freeze' ? st.buyFreeze() : st.buyDoubleXp()
    setConfirm(null)
    if (ok) {
      sfx.gem(); setMood('cheer')
      setToast({ ok: true, text: it.id === 'hearts' ? '¡Corazones al máximo!' : it.id === 'freeze' ? '¡Racha protegida!' : '¡Doble XP en marcha!' })
    } else {
      sfx.wrong(); setMood('sad')
      setToast({ ok: false, text: 'No se pudo comprar. Probá de nuevo.' })
    }
  }
  const tryBuy = (it: Item) => {
    if (it.blocked) { setMood('think'); setToast({ ok: false, text: it.blocked }); return }
    if (gems < it.price) { setMood('sad'); sfx.wrong(); setToast({ ok: false, text: `No te alcanzan las gemas: te faltan ${it.price - gems}.` }); return }
    sfx.tap(); setConfirm(it.id)
  }

  const speech = mood === 'cheer' ? '¡Buena compra! Se nota que sabés lo que hacés.'
    : mood === 'sad' ? 'Uy, las gemas no alcanzan… Hacé misiones y volvé.'
    : mood === 'think' ? 'Mmm, eso ya lo tenés cubierto.'
    : 'Pasá, pasá. Todo a precio de gemas.'

  return (
    <div className="flex h-full flex-col bg-white">
      <ScreenHeader title="Tienda" right={<GemChip />} />
      <div className="scroll-y relative flex-1 px-4 pb-8 pt-4">
        {toast && (
          <motion.div initial={{ y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} role="status"
            className={`absolute inset-x-4 top-2 z-10 rounded-2xl px-4 py-3 text-center font-display text-[15px] font-extrabold shadow-lg ${toast.ok ? 'bg-go-primary text-white' : 'bg-go-danger-tint text-go-danger border-2 border-go-danger'}`}>
            {toast.text}
          </motion.div>
        )}

        <div className="flex items-center gap-3 rounded-[20px] bg-go-surface p-3">
          <Skilly mood={mood} size={72} className="shrink-0" />
          <div className="relative rounded-2xl bg-white p-3 text-[14px] font-medium leading-snug shadow-sm">{speech}</div>
        </div>

        <h2 className="mb-2 mt-5 font-display text-[19px] font-extrabold">Potenciadores</h2>
        <ul className="flex flex-col gap-3">
          {items.map((it) => {
            const cant = !!it.blocked
            return (
              <li key={it.id} className="card-go flex items-center gap-3 p-3">
                <div className="grid h-[64px] w-[64px] shrink-0 place-items-center rounded-2xl bg-go-surface">{it.icon}</div>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-[16px] font-extrabold leading-tight">{it.title}</p>
                  <p className="text-[13px] leading-snug text-go-muted">{it.desc}</p>
                  {it.extra && <p className="mt-0.5 text-[12px] font-bold text-go-primary">{it.extra}</p>}
                  {it.blocked && <p className="mt-0.5 text-[12px] font-bold text-go-danger">{it.blocked}</p>}
                </div>
                <Button variant={cant ? 'primary' : 'secondary'} disabled={cant} onClick={() => tryBuy(it)}
                  className="!min-h-[44px] shrink-0 !px-3 !py-2 !text-[15px]" aria-label={`Comprar ${it.title} por ${it.price} gemas`}>
                  <GemIcon size={20} /> {it.price}
                </Button>
              </li>
            )
          })}
        </ul>

        <h2 className="mb-2 mt-6 font-display text-[19px] font-extrabold">Cómo conseguir gemas</h2>
        <ul className="card-go divide-y-2 divide-go-border">
          {[
            ['Terminá lecciones', '+5 gemas cada una'],
            ['Lecciones perfectas', '+5 gemas extra'],
            ['Misiones del día', '10 a 30 gemas por cofre'],
            ['Misión del mes', '100 gemas'],
          ].map(([a, b]) => (
            <li key={a} className="flex items-center gap-3 px-3 py-3">
              <GemIcon size={24} />
              <span className="flex-1 text-[15px] font-bold">{a}</span>
              <span className="text-[13px] font-medium text-go-muted">{b}</span>
            </li>
          ))}
        </ul>
      </div>

      <Modal open={!!current} onClose={() => setConfirm(null)}>
        {current && (
          <div className="text-center">
            <div className="mx-auto grid h-[72px] w-[72px] place-items-center rounded-2xl bg-go-surface">{current.icon}</div>
            <h3 className="mt-3 font-display text-[22px] font-extrabold">{current.title}</h3>
            <p className="mt-1 text-go-muted">{current.desc}</p>
            <p className="mt-3 flex items-center justify-center gap-1 font-display text-[18px] font-extrabold text-go-gem"><GemIcon size={22} /> {current.price} <span className="text-[13px] font-bold text-go-muted">(te quedan {gems - current.price})</span></p>
            <div className="mt-5 flex flex-col gap-2">
              <Button block onClick={() => buy(current)}>Comprar</Button>
              <Button block variant="secondary" onClick={() => setConfirm(null)}>Mejor no</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
