import { useEffect, useState } from 'react'
import { Button, GemIcon, HeartIcon, Modal, Skilly } from '@/design'
import { useApp } from '@/store/useApp'
import { now } from '@/domain/clock'
import { REFILL_COST, formatCountdown, msToNextHeart } from '@/domain/rules'
import { sfx } from '@/lib/sfx'

/**
 * Modal "¡Te quedaste sin vidas!" con tres salidas (como Duolingo):
 * practicar para ganar 1 corazón, recargar con gemas o esperar.
 * - `onPractice`: navegar a /practice/session?heal=1
 * - `onClose`: volver al inicio.
 * Usable desde cualquier pantalla (ej. PathPage al tocar un nodo con 0 corazones).
 */
export interface OutOfHeartsModalProps {
  open: boolean
  onClose: () => void
  onPractice: () => void
  /** Si se recarga con gemas: seguir (ej. retomar la lección). Por defecto se llama `onClose`. */
  onRefilled?: () => void
}

export function OutOfHeartsModal({ open, onClose, onPractice, onRefilled }: OutOfHeartsModalProps) {
  const gems = useApp((s) => s.gems)
  const hearts = useApp((s) => s.hearts)
  const anchor = useApp((s) => s.heartsAnchor)
  const [, tick] = useState(0)

  useEffect(() => {
    if (!open) return
    const i = setInterval(() => tick((n) => n + 1), 1000)
    return () => clearInterval(i)
  }, [open])

  const ms = msToNextHeart({ hearts, heartsAnchor: anchor }, now())
  // Cuando se cumple la espera, la tienda regenera el corazón.
  useEffect(() => {
    if (open && hearts === 0 && ms <= 1000) useApp.getState().refresh()
  }, [open, hearts, ms])

  const missing = Math.max(0, REFILL_COST - gems)
  const canRefill = missing === 0

  const refill = () => {
    if (!useApp.getState().refillHearts()) return
    sfx.gem()
    ;(onRefilled ?? onClose)()
  }

  return (
    <Modal open={open} onClose={onClose} sheet>
      <div className="max-h-[85dvh] overflow-y-auto">
        <div className="flex flex-col items-center text-center">
          <Skilly mood="sad" size={88} />
          <h2 className="mt-2 font-display text-[26px] font-extrabold leading-8 text-go-text">¡Te quedaste sin vidas!</h2>
          <p className="mb-4 mt-1 text-[15px] text-go-muted">Te quedaste sin corazones. Elegí cómo seguir.</p>
        </div>

        <div className="flex flex-col gap-3">
          <Button block onClick={onPractice}>
            <HeartIcon size={22} /> Practicá para ganar 1 corazón
          </Button>

          <Button block variant="secondary" disabled={!canRefill} onClick={refill} aria-label={canRefill ? `Recargar con ${REFILL_COST} gemas` : `Te faltan ${missing} gemas`}>
            <GemIcon size={22} />
            {canRefill ? `Recargar con ${REFILL_COST} gemas` : `Te faltan ${missing} gemas`}
          </Button>
          <p className="-mt-1 flex items-center justify-center gap-1 text-[13px] text-go-muted">
            Tenés <GemIcon size={16} /> <b className="font-display text-go-text">{gems}</b> gemas
          </p>

          <div className="rounded-go border-2 border-go-border bg-go-surface p-3 text-center">
            <p className="font-display text-[14px] font-bold uppercase tracking-wider text-go-muted">Esperar</p>
            <p className="font-display text-[26px] font-extrabold leading-8 text-go-text" aria-live="off">
              <span className="sr-only">Próximo corazón en </span>
              {formatCountdown(ms)}
            </p>
            <p className="text-[13px] text-go-muted">hasta tu próximo corazón</p>
          </div>

          <Button block variant="ghost" onClick={onClose}>Ahora no</Button>
        </div>
      </div>
    </Modal>
  )
}
