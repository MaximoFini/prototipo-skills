import { describe, it, expect } from 'vitest'
import {
  applyQuestEvent, claimQuestIn, completedCount, ensureQuests, generateDailyQuests, generateMonthlyQuest, msToEndOfDay, xpOfMonth,
} from './quests'
import type { QuestsState } from '@/domain/types'

const empty: QuestsState = { day: '', daily: [], monthly: null }

describe('generación de misiones', () => {
  it('es determinística por día y da 3 misiones distintas', () => {
    const a = generateDailyQuests('2026-10-15')
    const b = generateDailyQuests('2026-10-15')
    expect(a).toEqual(b)
    expect(a).toHaveLength(3)
    expect(new Set(a.map((q) => q.kind)).size).toBe(3)
  })
  it('las recompensas diarias están entre 10 y 30 gemas', () => {
    for (let d = 1; d <= 28; d++) {
      for (const q of generateDailyQuests(`2026-10-${String(d).padStart(2, '0')}`)) {
        expect(q.rewardGems).toBeGreaterThanOrEqual(10)
        expect(q.rewardGems).toBeLessThanOrEqual(30)
      }
    }
  })
  it('varía entre días', () => {
    const sets = new Set(Array.from({ length: 10 }, (_, i) => generateDailyQuests(`2026-10-${10 + i}`).map((q) => q.kind).join()))
    expect(sets.size).toBeGreaterThan(1)
  })
  it('la mensual vale 500 XP y 100 gemas', () => {
    const m = generateMonthlyQuest('2026-10-15')
    expect(m.target).toBe(500)
    expect(m.rewardGems).toBe(100)
    expect(m.title).toMatch(/500 XP/)
  })
  it('toma el XP ya ganado ese día / mes', () => {
    const xp = generateDailyQuests('2026-10-15', 12).find((q) => q.kind === 'xp')
    if (xp) expect(xp.progress).toBe(12)
    expect(xpOfMonth({ '2026-10-02': 40, '2026-10-15': 10, '2026-09-30': 99 }, '2026-10-15')).toBe(50)
  })
})

describe('ensureQuests', () => {
  it('inicializa desde vacío', () => {
    const q = ensureQuests(empty, '2026-10-15')
    expect(q.day).toBe('2026-10-15')
    expect(q.daily).toHaveLength(3)
    expect(q.monthly?.id).toBe('m-2026-10')
  })
  it('no toca nada si es el mismo día', () => {
    const q = ensureQuests(empty, '2026-10-15')
    expect(ensureQuests(q, '2026-10-15')).toBe(q)
  })
  it('cambia de día conservando la mensual, y la reinicia al cambiar de mes', () => {
    const q = applyQuestEvent(ensureQuests(empty, '2026-10-15'), { type: 'xp', amount: 100 })
    const next = ensureQuests(q, '2026-10-16')
    expect(next.daily.every((d) => d.progress === 0 || d.kind === 'xp')).toBe(true)
    expect(next.monthly?.progress).toBe(100)
    const nextMonth = ensureQuests(q, '2026-11-01')
    expect(nextMonth.monthly?.id).toBe('m-2026-11')
    expect(nextMonth.monthly?.progress).toBe(0)
  })
})

describe('progreso por eventos', () => {
  const base = (): QuestsState => ({
    day: '2026-10-15',
    daily: [
      { id: 'a', kind: 'xp', title: '', target: 30, progress: 0, rewardGems: 20, claimed: false },
      { id: 'b', kind: 'lessons', title: '', target: 2, progress: 0, rewardGems: 15, claimed: false },
      { id: 'c', kind: 'perfect', title: '', target: 1, progress: 0, rewardGems: 25, claimed: false },
      { id: 'd', kind: 'accuracy', title: '', target: 1, progress: 0, rewardGems: 30, claimed: false },
    ],
    monthly: generateMonthlyQuest('2026-10-15'),
  })
  it('xp suma a la de XP y a la mensual, sin pasarse del target', () => {
    const q = applyQuestEvent(base(), { type: 'xp', amount: 45 })
    expect(q.daily[0].progress).toBe(30)
    expect(q.monthly?.progress).toBe(45)
    expect(q.daily[1].progress).toBe(0)
  })
  it('una lección común suma a lecciones; la perfecta y precisa a las otras', () => {
    let q = applyQuestEvent(base(), { type: 'lesson', perfect: false, accuracy: 80 })
    expect(q.daily.map((d) => d.progress)).toEqual([0, 1, 0, 0])
    q = applyQuestEvent(q, { type: 'lesson', perfect: true, accuracy: 100 })
    expect(q.daily.map((d) => d.progress)).toEqual([0, 2, 1, 1])
  })
  it('claim da las gemas una sola vez', () => {
    const q = applyQuestEvent(base(), { type: 'xp', amount: 30 })
    expect(claimQuestIn(q, 'a').gems).toBe(20)
    const once = claimQuestIn(q, 'a')
    expect(claimQuestIn(once.quests, 'a').gems).toBe(0)
    expect(claimQuestIn(q, 'b').gems).toBe(0) // incompleta
    expect(completedCount(q)).toBe(1)
  })
})

describe('tiempo', () => {
  it('cuenta hasta la medianoche', () => {
    const t = new Date(2026, 9, 15, 23, 0, 0).getTime()
    expect(msToEndOfDay(t)).toBe(3600_000)
  })
})
