/** Tipos del panel de la academia (datos de demostración). */
export type Level = 'A1' | 'A2' | 'B1'
export type RiskLevel = 'bajo' | 'medio' | 'alto'
export type StudentStatus = 'activo' | 'en_riesgo' | 'inactivo'
export type PrizeType = 'merch' | 'clase' | 'descuento' | 'evento'
export type Milestone = 7 | 14 | 21

export interface Teacher {
  id: string
  name: string
}
export interface Commission {
  id: string
  name: string
  teacherId: string
  ageMin: number
  ageMax: number
}
export interface StudentPrize {
  type: PrizeType
  milestone: Milestone
  code: string
  redeemed: boolean
}
export interface VacationState {
  enrolled: boolean
  /** Día actual del desafío = racha vigente dentro de la ventana (0–21). */
  day: number
  /** Mejor tramo seguido dentro de la ventana de 21 días. */
  bestRun: number
  milestones: Milestone[]
  prizes: StudentPrize[]
}
export interface AdminStudent {
  id: number
  name: string
  age: number
  commissionId: string
  commission: string
  teacherId: string
  level: Level
  /** Racha vigente (0 si ya se cortó). */
  streak: number
  bestStreak: number
  /** Racha que tenía antes de cortarse (0 si sigue viva). */
  lostStreak: number
  xpWeek: number
  xpTotal: number
  /** Días desde la última práctica (0 = hoy). */
  daysInactive: number
  lastActiveDate: string
  lessonsCompleted: number
  /** Lecciones por día, últimos 60 días; el último elemento es hoy. */
  history: number[]
  /** Avance % por unidad (7 unidades). */
  unitProgress: number[]
  vacation: VacationState
}
