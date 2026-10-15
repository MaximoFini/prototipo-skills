import type { AppNotification } from '@/domain/types'

type T = Pick<AppNotification, 'kind' | 'title' | 'body'>

/** Textos locales de notificaciones (C2). Misma forma que `notificationTemplates` de C1. */
export const notifTexts = {
  streakRisk: (name: string, streak: number): T => ({
    kind: 'streak-risk',
    title: `${name}, tu racha de ${streak} días está en peligro`,
    body: 'Con 5 minutos la salvás. ¡Dale que podés!',
  }),
  leaguePromotion: (tierName: string): T => ({
    kind: 'league',
    title: `¡Subiste a ${tierName}!`,
    body: 'Terminaste en el top 10. Los de arriba ya te miran de reojo.',
  }),
  leagueDemotion: (tierName: string): T => ({
    kind: 'league',
    title: `Bajaste a ${tierName}`,
    body: 'Esta semana se puede remontar. Una lección y volvés a la pelea.',
  }),
  vacationMilestone: (day: number): T => ({
    kind: 'vacation',
    title: day >= 21 ? '¡Día 21! Completaste el desafío' : `¡Día ${day}! Hay premio esperándote`,
    body:
      day === 7 ? 'Ganaste una clase de conversación gratis. Reclamala en el Desafío de Vacaciones.'
      : day === 14 ? 'Ganaste 10 % de descuento en tu próxima cuota. ¡Reclamalo!'
      : 'Ganaste la remera y la entrada al evento Skills. ¡Reclamalos!',
  }),
  vacationReminder: (): T => ({
    kind: 'vacation',
    title: 'Tu inglés no se toma vacaciones',
    body: 'Vos sí, pero practicá 5 minutos y seguí sumando días en el Desafío.',
  }),
  friendNudge: (friendName: string): T => ({
    kind: 'friend',
    title: `${friendName} ya practicó hoy`,
    body: 'No lo dejes ganar. Una lección y quedan a mano.',
  }),
  comeback: (name: string): T => ({
    kind: 'generic',
    title: `${name}, te extrañamos`,
    body: 'Skilly está mirando la puerta. Volvé con una lección cortita.',
  }),
}
