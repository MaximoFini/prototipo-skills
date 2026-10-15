import { describe, it, expect } from 'vitest'
import { ACHIEVEMENTS } from '@/data/achievements'
import { counterValue, evaluateAchievements, levelFor, metricValue, nextProgress, withCounter } from './achievements'
import type { UserState } from '@/domain/types'

const base = (over: Partial<UserState> = {}) => ({
  stats: { lessonsCompleted: 0, perfectLessons: 0, correct: 0, total: 0, seconds: 0 },
  streak: { count: 0, best: 0, lastDay: null, freezes: 0, days: [], frozenDays: [] },
  xp: 0, vocabulary: [], gems: 50,
  league: { tier: 0, weekStart: '', weekXp: 0, standings: [], lastResult: null },
  achievements: {}, xpByDay: {}, settings: { dailyGoal: 20, sound: true, notifications: true, reminderTime: '', reminderDays: [] },
  ...over,
}) as Parameters<typeof evaluateAchievements>[0]

describe('definiciones', () => {
  it('hay ~20, ids únicos y tiers crecientes', () => {
    expect(ACHIEVEMENTS.length).toBeGreaterThanOrEqual(18)
    expect(new Set(ACHIEVEMENTS.map((a) => a.id)).size).toBe(ACHIEVEMENTS.length)
    for (const a of ACHIEVEMENTS) expect(a.tiers[0] < a.tiers[1] && a.tiers[1] < a.tiers[2]).toBe(true)
  })
})

describe('niveles', () => {
  const def = ACHIEVEMENTS.find((a) => a.id === 'lessons')!
  it('calcula el nivel por tiers', () => {
    expect([0, 1, 9, 10, 24, 25, 99].map((v) => levelFor(def, v))).toEqual([0, 1, 1, 2, 2, 3, 3])
  })
  it('progreso al próximo nivel', () => {
    expect(nextProgress(def, 5, 1)).toMatchObject({ target: 10, value: 5 })
    expect(nextProgress(def, 30, 3).pct).toBe(100)
  })
})

describe('evaluateAchievements', () => {
  it('desbloquea la primera lección', () => {
    const r = evaluateAchievements(base({ stats: { lessonsCompleted: 1, perfectLessons: 0, correct: 0, total: 0, seconds: 0 } }), 123)
    expect(r.unlocked.map((u) => u.def.id)).toContain('lessons')
    expect(r.achievements.lessons).toEqual({ level: 1, unlockedAt: 123 })
  })
  it('sube de nivel sin perder la fecha original y no baja', () => {
    const s = base({ xp: 600, achievements: { xp: { level: 1, unlockedAt: 5 } } })
    const r = evaluateAchievements(s, 99)
    expect(r.achievements.xp).toEqual({ level: 2, unlockedAt: 5 })
    const again = evaluateAchievements({ ...s, achievements: r.achievements }, 100)
    expect(again.unlocked).toHaveLength(0)
    expect(again.achievements).toBe(r.achievements)
  })
  it('usa la mejor racha, no la actual', () => {
    const s = base({ streak: { count: 0, best: 8, lastDay: null, freezes: 0, days: [], frozenDays: [] } })
    expect(metricValue('streak', s)).toBe(8)
    expect(evaluateAchievements(s, 1).achievements.streak.level).toBe(2)
  })
  it('contadores internos', () => {
    let a = withCounter({}, 'early')
    a = withCounter(a, 'early')
    expect(counterValue(a, 'early')).toBe(2)
    expect(a['__n:early'].level).toBe(0)
    expect(evaluateAchievements(base({ achievements: a }), 1).achievements.early.level).toBe(1)
  })
  it('liga: tier 2 = nivel plata', () => {
    expect(evaluateAchievements(base({ league: { tier: 2, weekStart: '', weekXp: 0, standings: [], lastResult: null } }), 1).achievements.league.level).toBe(2)
  })
})
