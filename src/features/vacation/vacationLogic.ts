import { addDays, diffDays } from '@/domain/clock'
import { CHALLENGE_DAYS, MILESTONE_DAYS, REWARDS, type Reward } from '@/data/rewards'
import type { OwnedReward } from '@/domain/types'

export type CellStatus = 'done' | 'today' | 'future' | 'missed'
export interface ChallengeCell {
  day: number // 1..21
  date: string
  status: CellStatus
  /** Es el casillero de hoy (puede estar hecho o pendiente). */
  isToday: boolean
}

export interface ChallengeInfo {
  /** Días consecutivos practicados desde startDay. */
  progress: number
  /** Número de día del desafío en el que estamos hoy (1..21; 0 si todavía no empezó). */
  dayNumber: number
  practicedToday: boolean
  /** true si se salteó algún día pasado (la racha del desafío se cortó). */
  broken: boolean
  /** Día (1..21) en el que se cortó, o null. */
  brokenAt: number | null
  finished: boolean
  /** Pasaron los 21 días sin completarlo. */
  expired: boolean
  endDay: string
  cells: ChallengeCell[]
}

export function computeChallenge(streakDays: string[], startDay: string, todayKey: string): ChallengeInfo {
  const set = new Set(streakDays)
  const endDay = addDays(startDay, CHALLENGE_DAYS - 1)
  const idxToday = diffDays(startDay, todayKey) // 0-based; <0 = no empezó
  let progress = 0
  while (progress < CHALLENGE_DAYS && set.has(addDays(startDay, progress))) progress++
  let brokenAt: number | null = null
  for (let i = 0; i < CHALLENGE_DAYS && i < idxToday; i++) {
    if (!set.has(addDays(startDay, i))) {
      brokenAt = i + 1
      break
    }
  }
  const cells: ChallengeCell[] = Array.from({ length: CHALLENGE_DAYS }, (_, i) => {
    const date = addDays(startDay, i)
    const done = set.has(date)
    const isToday = i === idxToday
    const status: CellStatus = done ? 'done' : isToday ? 'today' : i < idxToday ? 'missed' : 'future'
    return { day: i + 1, date, status, isToday }
  })
  const finished = progress >= CHALLENGE_DAYS
  return {
    progress,
    dayNumber: idxToday < 0 ? 0 : Math.min(CHALLENGE_DAYS, idxToday + 1),
    practicedToday: set.has(todayKey),
    broken: brokenAt !== null,
    brokenAt,
    finished,
    expired: !finished && idxToday >= CHALLENGE_DAYS,
    endDay,
    cells,
  }
}

/** Días consecutivos practicados desde `startDay` hasta hoy. */
export function challengeProgress(streakDays: string[], startDay: string, todayKey: string): number {
  return computeChallenge(streakDays, startDay, todayKey).progress
}

/** Premios cuyo hito ya se alcanzó con `progress` días. */
export function milestonesReached(progress: number): Reward[] {
  return REWARDS.filter((r) => progress >= r.day)
}

/** Próximo hito (7/14/21) todavía no alcanzado, con los días que faltan y sus premios. */
export function nextMilestone(progress: number): { day: number; remaining: number; rewards: Reward[] } | null {
  const day = MILESTONE_DAYS.find((d) => d > progress)
  if (!day) return null
  return { day, remaining: day - progress, rewards: REWARDS.filter((r) => r.day === day) }
}

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
function fnv(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}
/** Código de canje determinístico por premio + nombre. Ej: `SKG-7K3Q`. */
export function rewardCode(rewardId: string, name: string): string {
  let h = fnv(`${rewardId}|${name.trim().toLowerCase()}`)
  let out = ''
  for (let i = 0; i < 4; i++) {
    out += ALPHABET[h % ALPHABET.length]
    h = Math.floor(h / ALPHABET.length) ^ Math.imul(h, 2654435761) >>> 0
    h >>>= 0
  }
  return `SKG-${out}`
}

export function isOwned(owned: OwnedReward[], rewardId: string): boolean {
  return owned.some((o) => o.rewardId === rewardId)
}
