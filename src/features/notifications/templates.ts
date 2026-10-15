import type { AppNotification } from '@/domain/types'

type Tpl = Pick<AppNotification, 'kind' | 'title' | 'body'>

/** Plantillas de notificaciones mock (tono Skills Go). Cada una está lista para `pushNotification`. */
export const notificationTemplates = {
  streakRisk: (name: string, streak: number): Tpl => ({
    kind: 'streak-risk',
    title: `${name ? name + ', t' : 'T'}u racha está en juego`,
    body: `Tu racha de ${streak} ${streak === 1 ? 'día' : 'días'} está en peligro. ¡Con 5 minutos la salvás!`,
  }),
  leaguePromotion: (): Tpl => ({
    kind: 'league',
    title: '¡Subiste de liga!',
    body: 'Terminaste en el top 10. Nueva liga, nuevos rivales. ¡A romperla!',
  }),
  leagueDemotion: (): Tpl => ({
    kind: 'league',
    title: 'Bajaste de liga',
    body: 'Se te escapó por poquito. Una buena semana y volvés a subir.',
  }),
  vacationMilestone: (day: number): Tpl => ({
    kind: 'vacation',
    title: `¡Día ${day} del Desafío!`,
    body: day >= 21 ? '¡Lo lograste! 21 días seguidos. Pasá a reclamar tu premio.' : `Ya vas por el día ${day}. Seguí así y destrabás un premio.`,
  }),
  vacationReminder: (): Tpl => ({
    kind: 'vacation',
    title: 'Tu inglés no se toma vacaciones',
    body: 'El inglés no se toma vacaciones. Vos sí, pero practicá 5 minutos.',
  }),
  friendNudge: (friendName: string): Tpl => ({
    kind: 'friend',
    title: `${friendName} te pasó`,
    body: `${friendName} te pasó en XP. ¿Lo vas a dejar?`,
  }),
  comeback: (name: string): Tpl => ({
    kind: 'generic',
    title: name ? `${name}, ¿todo bien?` : '¿Todo bien?',
    body: 'Skilly te extraña… 😢 Volvé a practicar.',
  }),
}
