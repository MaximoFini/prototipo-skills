import type { DailyGoal, StreakState } from './types'
import { HOUR, addDays, diffDays } from './clock'

// ---------------- Constantes de negocio (ver PLANIFICACION.md 3.2) ----------------
export const HEARTS_MAX = 5
export const HEART_REGEN_MS = 5 * HOUR
export const REFILL_COST = 350
export const FREEZE_COST = 200
export const DOUBLE_XP_COST = 100
export const DOUBLE_XP_MS = 15 * 60_000
export const XP_BASE = 10
export const XP_PERFECT = 5
export const XP_FAST = 3
export const GEMS_LESSON = 5
export const GEMS_PERFECT = 5
export const FAST_SECONDS_PER_EXERCISE = 12
export const PRACTICE_EXERCISES = 5
export const GOAL_LABELS: Record<DailyGoal, { name: string; minutes: number }> = {
  10: { name: 'Casual', minutes: 5 },
  20: { name: 'Regular', minutes: 10 },
  30: { name: 'Serio', minutes: 15 },
  50: { name: 'Intenso', minutes: 20 },
}

// ---------------- Corazones ----------------
export interface HeartsState {
  hearts: number
  heartsAnchor: number
}

/** Aplica la regeneración acumulada hasta `nowMs`. */
export function regenHearts(s: HeartsState, nowMs: number): HeartsState {
  if (s.hearts >= HEARTS_MAX) return { hearts: HEARTS_MAX, heartsAnchor: nowMs }
  const elapsed = Math.max(0, nowMs - s.heartsAnchor)
  const gained = Math.floor(elapsed / HEART_REGEN_MS)
  if (gained <= 0) return s
  const hearts = Math.min(HEARTS_MAX, s.hearts + gained)
  return { hearts, heartsAnchor: hearts >= HEARTS_MAX ? nowMs : s.heartsAnchor + gained * HEART_REGEN_MS }
}

/** Pierde un corazón. Si estaba lleno, la regeneración empieza a contar desde ahora. */
export function loseHeart(s: HeartsState, nowMs: number): HeartsState {
  if (s.hearts <= 0) return s
  const anchor = s.hearts >= HEARTS_MAX ? nowMs : s.heartsAnchor
  return { hearts: s.hearts - 1, heartsAnchor: anchor }
}

/** ms hasta el próximo corazón (0 si está lleno). */
export function msToNextHeart(s: HeartsState, nowMs: number): number {
  if (s.hearts >= HEARTS_MAX) return 0
  return Math.max(0, HEART_REGEN_MS - ((nowMs - s.heartsAnchor) % HEART_REGEN_MS))
}

export function formatCountdown(ms: number): string {
  const total = Math.ceil(ms / 1000)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`
  return `${m}:${String(s).padStart(2, '0')}`
}

// ---------------- Racha ----------------
/** Resuelve cortes de racha al abrir la app / cambiar el día. Consume congeladores si hay. */
export function resolveStreak(streak: StreakState, todayKey: string): StreakState {
  if (!streak.lastDay || streak.count === 0) return streak
  let missed = diffDays(streak.lastDay, todayKey) - 1 // días completos sin práctica
  if (missed <= 0) return streak
  let freezes = streak.freezes
  const frozenDays = [...streak.frozenDays]
  let day = streak.lastDay
  while (missed > 0 && freezes > 0) {
    day = addDays(day, 1)
    frozenDays.push(day)
    freezes--
    missed--
  }
  if (missed > 0) return { ...streak, count: 0, freezes, frozenDays }
  // Cubrió todos los días faltantes: la racha sigue viva, avanzamos el ancla.
  return { ...streak, freezes, frozenDays, lastDay: day }
}

/** Registra actividad hoy. Devuelve el nuevo estado y si extendió la racha. */
export function applyActivity(streak: StreakState, todayKey: string): { streak: StreakState; extended: boolean } {
  const s = resolveStreak(streak, todayKey)
  if (s.lastDay === todayKey) return { streak: s, extended: false }
  const count = s.count + 1
  return {
    extended: true,
    streak: {
      ...s,
      count,
      best: Math.max(s.best, count),
      lastDay: todayKey,
      days: s.days.includes(todayKey) ? s.days : [...s.days, todayKey],
    },
  }
}

export function practicedToday(streak: StreakState, todayKey: string): boolean {
  return streak.lastDay === todayKey
}

/** La racha está en peligro si hay racha y todavía no practicó hoy. */
export function streakAtRisk(streak: StreakState, todayKey: string): boolean {
  const s = resolveStreak(streak, todayKey)
  return s.count > 0 && s.lastDay !== todayKey
}

// ---------------- XP y gemas ----------------
export function lessonXp(opts: { perfect: boolean; fast: boolean }): number {
  return XP_BASE + (opts.perfect ? XP_PERFECT : 0) + (opts.fast ? XP_FAST : 0)
}
export function lessonGems(perfect: boolean): number {
  return GEMS_LESSON + (perfect ? GEMS_PERFECT : 0)
}
