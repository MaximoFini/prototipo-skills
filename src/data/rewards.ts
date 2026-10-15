/** Premios del Desafío de Vacaciones (canjeables en la academia). */
export const CHALLENGE_DAYS = 21
export const MILESTONE_DAYS = [7, 14, 21] as const

export interface Reward {
  id: string
  title: string
  description: string
  /** Día del desafío en que se desbloquea. */
  day: number
  /** Clave del ícono (lo resuelve la UI). */
  icon: 'message' | 'percent' | 'shirt' | 'ticket'
}

export const REWARDS: Reward[] = [
  { id: 'conv-class', title: 'Clase de conversación gratis', description: 'Una clase de conversación con un profe de Skills, sin costo.', day: 7, icon: 'message' },
  { id: 'fee-discount', title: '10 % de descuento en tu próxima cuota', description: 'Se aplica en la cuota del mes siguiente.', day: 14, icon: 'percent' },
  { id: 'skills-shirt', title: 'Remera Skills', description: 'La remera oficial del escudo. Pasala a buscar por la academia.', day: 21, icon: 'shirt' },
  { id: 'event-ticket', title: 'Entrada a evento Skills', description: 'Una entrada para el próximo evento de la academia.', day: 21, icon: 'ticket' },
]

export function getReward(id: string): Reward | undefined {
  return REWARDS.find((r) => r.id === id)
}
