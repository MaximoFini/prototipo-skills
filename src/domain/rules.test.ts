import { describe, it, expect } from 'vitest'
import { HEARTS_MAX, HEART_REGEN_MS, regenHearts, loseHeart, msToNextHeart, resolveStreak, applyActivity, streakAtRisk, lessonXp, lessonGems } from './rules'
import { checkTyped, checkBuilt, normalize } from './validate'
import { addDays, diffDays, weekStart } from './clock'
import type { StreakState } from './types'

const base: StreakState = { count: 5, best: 5, lastDay: '2026-01-10', freezes: 0, days: [], frozenDays: [] }

describe('corazones', () => {
  it('pierde un corazón y arranca la regeneración si estaba lleno', () => {
    const s = loseHeart({ hearts: 5, heartsAnchor: 0 }, 1000)
    expect(s).toEqual({ hearts: 4, heartsAnchor: 1000 })
  })
  it('no baja de 0', () => {
    expect(loseHeart({ hearts: 0, heartsAnchor: 0 }, 5).hearts).toBe(0)
  })
  it('regenera 1 cada 5 h', () => {
    const s = regenHearts({ hearts: 2, heartsAnchor: 0 }, HEART_REGEN_MS * 2 + 10)
    expect(s.hearts).toBe(4)
    expect(s.heartsAnchor).toBe(HEART_REGEN_MS * 2)
  })
  it('no pasa del máximo', () => {
    expect(regenHearts({ hearts: 4, heartsAnchor: 0 }, HEART_REGEN_MS * 10).hearts).toBe(HEARTS_MAX)
  })
  it('cuenta regresiva', () => {
    expect(msToNextHeart({ hearts: 3, heartsAnchor: 0 }, HEART_REGEN_MS - 1000)).toBe(1000)
    expect(msToNextHeart({ hearts: 5, heartsAnchor: 0 }, 5)).toBe(0)
  })
})

describe('racha', () => {
  it('suma 1 por día y no duplica el mismo día', () => {
    const a = applyActivity(base, '2026-01-11')
    expect(a.extended).toBe(true)
    expect(a.streak.count).toBe(6)
    const b = applyActivity(a.streak, '2026-01-11')
    expect(b.extended).toBe(false)
    expect(b.streak.count).toBe(6)
  })
  it('se corta si pasó un día sin práctica', () => {
    expect(resolveStreak(base, '2026-01-12').count).toBe(0)
    expect(applyActivity(base, '2026-01-12').streak.count).toBe(1)
  })
  it('un congelador cubre un día', () => {
    const s = resolveStreak({ ...base, freezes: 1 }, '2026-01-12')
    expect(s.count).toBe(5)
    expect(s.freezes).toBe(0)
    expect(s.frozenDays).toContain('2026-01-11')
    expect(applyActivity({ ...base, freezes: 1 }, '2026-01-12').streak.count).toBe(6)
  })
  it('en peligro si no practicó hoy', () => {
    expect(streakAtRisk(base, '2026-01-11')).toBe(true)
    expect(streakAtRisk({ ...base, lastDay: '2026-01-11' }, '2026-01-11')).toBe(false)
  })
})

describe('xp y gemas', () => {
  it('suma bonos', () => {
    expect(lessonXp({ perfect: false, fast: false })).toBe(10)
    expect(lessonXp({ perfect: true, fast: true })).toBe(18)
    expect(lessonGems(true)).toBe(10)
  })
})

describe('validación', () => {
  it('normaliza acentos y puntuación', () => {
    expect(normalize('¿Cómo estás?')).toBe('como estas')
  })
  it('acepta variantes, avisa typos', () => {
    expect(checkTyped('i am a student.', ['I am a student']).verdict).toBe('correct')
    expect(checkTyped('i am a studnt', ['I am a student']).verdict).toBe('almost')
    expect(checkTyped('hola', ['I am a student']).verdict).toBe('wrong')
  })
  it('arma oraciones', () => {
    expect(checkBuilt(['I', 'am', 'a', 'student'], ['I am a student']).correct).toBe(true)
    expect(checkBuilt(['am', 'I'], ['I am a student']).correct).toBe(false)
  })
})

describe('fechas', () => {
  it('suma y resta días', () => {
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01')
    expect(diffDays('2026-01-01', '2026-01-04')).toBe(3)
  })
  it('lunes como inicio de semana', () => {
    expect(weekStart('2026-10-15')).toBe('2026-10-12')
    expect(weekStart('2026-10-18')).toBe('2026-10-12')
  })
})
