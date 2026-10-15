import { ACHIEVEMENTS, MEDALS, type AchievementDef, type AchievementMetric } from '@/data/achievements'
import type { AchievementState, UserState } from '@/domain/types'

// ---------------------------------------------------------------------------
// Evaluación de logros. La parte pura (valores, niveles, diff) se testea sin store.
// Contadores internos (madrugador, noctámbulo, misiones): se guardan en `achievements`
// con clave '__n:<nombre>' → { level: 0, unlockedAt: <contador> }. No son logros reales.
// ---------------------------------------------------------------------------

export const COUNTER_PREFIX = '__n:'
export type CounterName = 'early' | 'night' | 'quests'

export const isCounterKey = (k: string) => k.startsWith(COUNTER_PREFIX)
export const counterValue = (a: Record<string, AchievementState>, name: CounterName): number =>
  a[COUNTER_PREFIX + name]?.unlockedAt ?? 0

export function withCounter(a: Record<string, AchievementState>, name: CounterName, by = 1): Record<string, AchievementState> {
  return { ...a, [COUNTER_PREFIX + name]: { level: 0, unlockedAt: counterValue(a, name) + by } }
}

type Evaluable = Pick<UserState, 'stats' | 'streak' | 'xp' | 'vocabulary' | 'gems' | 'league' | 'achievements' | 'xpByDay' | 'settings'>

export function metricValue(metric: AchievementMetric, s: Evaluable): number {
  switch (metric) {
    case 'lessons': return s.stats.lessonsCompleted
    case 'perfect': return s.stats.perfectLessons
    case 'streak': return Math.max(s.streak.best, s.streak.count)
    case 'xp': return s.xp
    case 'words': return s.vocabulary.length
    case 'early': return counterValue(s.achievements, 'early')
    case 'night': return counterValue(s.achievements, 'night')
    case 'quests': return counterValue(s.achievements, 'quests')
    case 'league': return s.league.tier
    case 'gems': return s.gems
    case 'correct': return s.stats.correct
    case 'minutes': return Math.floor(s.stats.seconds / 60)
    case 'goal-days': return Object.values(s.xpByDay).filter((v) => v >= s.settings.dailyGoal).length
    case 'practice-days': return s.streak.days.length
  }
}

/** Nivel (0..3) que corresponde a un valor. */
export function levelFor(def: Pick<AchievementDef, 'tiers'>, value: number): number {
  return def.tiers.reduce((lvl, t, i) => (value >= t ? i + 1 : lvl), 0)
}

/** Progreso hacia el próximo nivel: { value, target, pct } (en oro: 100%). */
export function nextProgress(def: AchievementDef, value: number, level: number) {
  if (level >= 3) return { value: def.tiers[2], target: def.tiers[2], pct: 100 }
  const target = def.tiers[level]
  const prev = level === 0 ? 0 : def.tiers[level - 1]
  const pct = Math.max(0, Math.min(100, ((Math.min(value, target) - prev) / (target - prev)) * 100))
  return { value: Math.min(value, target), target, pct }
}

export interface Unlock { def: AchievementDef; level: number; first: boolean }

/** Compara el estado contra las definiciones. Los niveles nunca bajan. */
export function evaluateAchievements(s: Evaluable, at: number): { achievements: Record<string, AchievementState>; unlocked: Unlock[] } {
  const next = { ...s.achievements }
  const unlocked: Unlock[] = []
  for (const def of ACHIEVEMENTS) {
    const prev = s.achievements[def.id]
    const lvl = levelFor(def, metricValue(def.metric, s))
    if (lvl > (prev?.level ?? 0)) {
      next[def.id] = { level: lvl, unlockedAt: prev?.unlockedAt ?? at }
      unlocked.push({ def, level: lvl, first: !prev || prev.level === 0 })
    }
  }
  return { achievements: unlocked.length ? next : s.achievements, unlocked }
}

export function unlockMessage(u: Unlock): string {
  return `${u.def.title} · ${MEDALS[u.level]}`
}
