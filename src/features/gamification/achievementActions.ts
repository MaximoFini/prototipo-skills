import { useApp } from '@/store/useApp'
import { now } from '@/domain/clock'
import { evaluateAchievements, unlockMessage, withCounter, type CounterName } from './achievements'

/** Evalúa logros contra el estado actual; si hay novedades, las guarda y avisa por notificación. */
export function checkAchievements() {
  const s = useApp.getState()
  const { achievements, unlocked } = evaluateAchievements(s, now())
  if (!unlocked.length) return
  s.patch({ achievements })
  // Máximo 2 avisos individuales; el resto se resume para no spamear.
  unlocked.slice(0, 2).forEach((u) =>
    s.pushNotification({ kind: 'generic', title: '¡Logro desbloqueado!', body: unlockMessage(u) }),
  )
  if (unlocked.length > 2) {
    s.pushNotification({ kind: 'generic', title: '¡Logros desbloqueados!', body: `Y ${unlocked.length - 2} más. Mirá todos en tu perfil.` })
  }
}

export function bumpCounter(name: CounterName, by = 1) {
  const s = useApp.getState()
  s.patch({ achievements: withCounter(s.achievements, name, by) })
}
