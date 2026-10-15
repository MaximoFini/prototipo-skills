import { describe, expect, it } from 'vitest'
import { addDays } from '@/domain/clock'
import { currentStreakOf, generateStudents, commissions } from './students'
import { atRiskStudents, campaignStats, computeKpis, dailyActivity, fillTemplate, filterStudents, riskCsv, riskLevel, sortStudents, streakHistogram, studentStatus, toCsv } from './metrics'

const REF = '2026-10-15'
const list = generateStudents(REF)

describe('datos demo', () => {
  it('son estables (seed fijo) y tienen el tamaño esperado', () => {
    expect(generateStudents(REF).map((s) => s.name)).toEqual(list.map((s) => s.name))
    expect(list).toHaveLength(120)
    expect(commissions).toHaveLength(8)
    expect(new Set(list.map((s) => s.name)).size).toBe(120)
    expect(list.every((s) => s.age >= 12 && s.age <= 18 && s.history.length === 60)).toBe(true)
  })
  it('la fecha de última actividad coincide con los días de inactividad', () => {
    for (const s of list) expect(s.lastActiveDate).toBe(addDays(REF, -s.daysInactive))
  })
})

describe('racha', () => {
  it('sigue viva si practicó ayer y se corta con 2 días de pausa', () => {
    expect(currentStreakOf([0, 1, 1, 1, 0])).toEqual({ streak: 3, daysInactive: 1 })
    expect(currentStreakOf([1, 1, 1, 0, 0])).toEqual({ streak: 0, daysInactive: 2 })
    expect(currentStreakOf([1, 2, 1])).toEqual({ streak: 3, daysInactive: 0 })
  })
})

describe('riesgo', () => {
  it('clasifica por días sin practicar y racha perdida', () => {
    expect(riskLevel({ daysInactive: 0, lostStreak: 0 })).toBe('bajo')
    expect(riskLevel({ daysInactive: 2, lostStreak: 1 })).toBe('bajo')
    expect(riskLevel({ daysInactive: 2, lostStreak: 5 })).toBe('medio')
    expect(riskLevel({ daysInactive: 3, lostStreak: 0 })).toBe('medio')
    expect(riskLevel({ daysInactive: 3, lostStreak: 9 })).toBe('alto')
    expect(riskLevel({ daysInactive: 6, lostStreak: 0 })).toBe('alto')
  })
  it('estado: activo, en riesgo, inactivo', () => {
    expect(studentStatus({ daysInactive: 1 })).toBe('activo')
    expect(studentStatus({ daysInactive: 4 })).toBe('en_riesgo')
    expect(studentStatus({ daysInactive: 12 })).toBe('inactivo')
  })
  it('la lista de riesgo viene ordenada de mayor a menor', () => {
    const r = atRiskStudents(list)
    expect(r.length).toBeGreaterThan(5)
    expect(r.every((s) => riskLevel(s) !== 'bajo')).toBe(true)
    const order = { alto: 2, medio: 1, bajo: 0 }
    for (let i = 1; i < r.length; i++) expect(order[riskLevel(r[i - 1])]).toBeGreaterThanOrEqual(order[riskLevel(r[i])])
  })
})

describe('KPIs y series', () => {
  it('activos hoy <= semana <= mes', () => {
    const k = computeKpis(list)
    expect(k.activeToday).toBeLessThanOrEqual(k.activeWeek)
    expect(k.activeWeek).toBeLessThanOrEqual(k.activeMonth)
    expect(k.total).toBe(120)
  })
  it('la serie diaria termina con los activos de hoy', () => {
    const d = dailyActivity(list, 30, REF)
    expect(d).toHaveLength(30)
    expect(d[29].active).toBe(computeKpis(list).activeToday)
  })
  it('el histograma de rachas suma el total', () => {
    expect(streakHistogram(list).reduce((a, b) => a + b.alumnos, 0)).toBe(120)
  })
  it('campaña: el alcance es decreciente', () => {
    const c = campaignStats(list)
    expect(c.reach[0].students).toBeGreaterThanOrEqual(c.reach[1].students)
    expect(c.reach[1].students).toBeGreaterThanOrEqual(c.reach[2].students)
    expect(c.totalCost).toBeGreaterThan(0)
  })
})

describe('filtros, orden y CSV', () => {
  it('filtra por comisión, nivel y búsqueda sin acentos', () => {
    const c1 = filterStudents(list, { commission: 'c1' })
    expect(c1).toHaveLength(15)
    const target = list[0]
    expect(filterStudents(list, { q: target.name.toUpperCase() }).map((s) => s.id)).toContain(target.id)
    expect(filterStudents(list, { level: 'B1' }).every((s) => s.level === 'B1')).toBe(true)
  })
  it('ordena por racha', () => {
    const s = sortStudents(list, 'streak', 'desc')
    expect(s[0].streak).toBeGreaterThanOrEqual(s[1].streak)
  })
  it('CSV escapa comillas y separadores y lleva encabezados en español', () => {
    expect(toCsv(['A', 'B'], [['x;y', 'di "hola"']])).toBe('﻿A;B\r\n"x;y";"di ""hola"""')
    const csv = riskCsv(atRiskStudents(list).slice(0, 3), new Set([atRiskStudents(list)[0].id]))
    expect(csv).toContain('Alumno;Comisión;Días sin practicar')
    expect(csv.split('\r\n')).toHaveLength(4)
  })
  it('completa la plantilla del mensaje', () => {
    const s = atRiskStudents(list)[0]
    const m = fillTemplate('¡Hola {nombre}! Racha de {n} días', s)
    expect(m).not.toContain('{')
  })
})
