import { describe, expect, it } from 'vitest'
import { addDays } from '@/domain/clock'
import { challengeProgress, computeChallenge, milestonesReached, nextMilestone, rewardCode } from './vacationLogic'

const start = '2026-10-01'
const run = (n: number, from = start) => Array.from({ length: n }, (_, i) => addDays(from, i))

describe('challengeProgress', () => {
  it('cuenta días consecutivos desde startDay', () => {
    expect(challengeProgress(run(5), start, addDays(start, 4))).toBe(5)
  })
  it('ignora días anteriores al inicio', () => {
    expect(challengeProgress([addDays(start, -2), ...run(3)], start, addDays(start, 2))).toBe(3)
  })
  it('se frena en el primer hueco', () => {
    const days = [...run(3), ...run(2, addDays(start, 4))]
    expect(challengeProgress(days, start, addDays(start, 5))).toBe(3)
  })
  it('hoy sin practicar no corta el desafío', () => {
    const info = computeChallenge(run(4), start, addDays(start, 4))
    expect(info.progress).toBe(4)
    expect(info.broken).toBe(false)
    expect(info.dayNumber).toBe(5)
    expect(info.practicedToday).toBe(false)
    expect(info.cells[4].status).toBe('today')
  })
  it('detecta el corte y el día en que pasó', () => {
    const info = computeChallenge([...run(2), addDays(start, 3)], start, addDays(start, 4))
    expect(info.broken).toBe(true)
    expect(info.brokenAt).toBe(3)
    expect(info.cells[2].status).toBe('missed')
  })
  it('termina a los 21', () => {
    const info = computeChallenge(run(21), start, addDays(start, 20))
    expect(info.finished).toBe(true)
    expect(info.progress).toBe(21)
  })
})

describe('hitos', () => {
  it('milestonesReached devuelve los premios alcanzados', () => {
    expect(milestonesReached(6)).toHaveLength(0)
    expect(milestonesReached(7).map((r) => r.id)).toEqual(['conv-class'])
    expect(milestonesReached(14)).toHaveLength(2)
    expect(milestonesReached(21)).toHaveLength(4)
  })
  it('nextMilestone', () => {
    expect(nextMilestone(0)).toMatchObject({ day: 7, remaining: 7 })
    expect(nextMilestone(7)).toMatchObject({ day: 14, remaining: 7 })
    expect(nextMilestone(20)).toMatchObject({ day: 21, remaining: 1 })
    expect(nextMilestone(21)).toBeNull()
  })
})

describe('rewardCode', () => {
  it('formato SKG-XXXX y determinístico', () => {
    const c = rewardCode('conv-class', 'Sofi')
    expect(c).toMatch(/^SKG-[A-Z2-9]{4}$/)
    expect(rewardCode('conv-class', 'Sofi')).toBe(c)
    expect(rewardCode('conv-class', ' sofi ')).toBe(c)
  })
  it('cambia con el premio o el nombre', () => {
    expect(rewardCode('fee-discount', 'Sofi')).not.toBe(rewardCode('conv-class', 'Sofi'))
    expect(rewardCode('conv-class', 'Mati')).not.toBe(rewardCode('conv-class', 'Sofi'))
  })
})
