import { describe, it, expect } from 'vitest'
import { levels, allUnits, placementTest } from './content'
import type { Exercise } from '@/domain/types'

const tokens = (s: string) => s.split(' ').filter(Boolean)

function checkExercise(ex: Exercise, where: string) {
  expect(ex.id, `${where}: id`).toBeTruthy()
  expect(ex.explanation, `${where}/${ex.id}: falta explicación`).toBeTruthy()
  switch (ex.type) {
    case 'choose-translation':
    case 'listen-choose':
    case 'fill-blank':
      expect(ex.options.length, `${where}/${ex.id}: opciones 3-4`).toBeGreaterThanOrEqual(3)
      expect(ex.options.length).toBeLessThanOrEqual(4)
      expect(ex.correct).toBeGreaterThanOrEqual(0)
      expect(ex.correct).toBeLessThan(ex.options.length)
      expect(new Set(ex.options).size, `${where}/${ex.id}: opciones repetidas`).toBe(ex.options.length)
      if (ex.type === 'fill-blank') expect(ex.sentence.split('___').length, `${where}/${ex.id}: un solo ___`).toBe(2)
      break
    case 'choose-image':
      expect(ex.options.length).toBe(4)
      expect(ex.correct).toBeLessThan(4)
      break
    case 'build-sentence': {
      expect(ex.accepted.length).toBeGreaterThan(0)
      for (const a of ex.accepted) for (const t of tokens(a)) expect(ex.bank, `${where}/${ex.id}: "${t}" no está en el banco`).toContain(t)
      expect(ex.bank.length).toBeGreaterThan(tokens(ex.accepted[0]).length)
      break
    }
    case 'type-translation':
    case 'listen-type':
      expect(ex.accepted.length).toBeGreaterThan(0)
      break
    case 'match-pairs':
      expect(ex.pairs.length).toBeGreaterThanOrEqual(4)
      expect(ex.pairs.length).toBeLessThanOrEqual(5)
      expect(new Set(ex.pairs.map((p) => p.en)).size).toBe(ex.pairs.length)
      break
    case 'speak':
      expect(ex.phrase).toBeTruthy()
      break
  }
}

describe('contenido: estructura', () => {
  it('ids de unidades y lecciones únicos', () => {
    const ids = allUnits.flatMap((u) => [u.id, ...u.lessons.map((l) => l.id)])
    expect(new Set(ids).size).toBe(ids.length)
  })
  for (const unit of allUnits) {
    for (const lesson of unit.lessons) {
      if (unit.comingSoon && lesson.exercises.length === 0) continue
      it(`lección ${lesson.id}: 8–10 ejercicios, ≥4 tipos distintos, bien formados`, () => {
        expect(lesson.exercises.length).toBeGreaterThanOrEqual(8)
        expect(lesson.exercises.length).toBeLessThanOrEqual(10)
        expect(new Set(lesson.exercises.map((e) => e.type)).size).toBeGreaterThanOrEqual(4)
        expect(new Set(lesson.exercises.map((e) => e.id)).size).toBe(lesson.exercises.length)
        lesson.exercises.forEach((e) => checkExercise(e, lesson.id))
      })
    }
  }
})

describe('contenido: completitud (Fase 1)', () => {
  const [a1, a2, b1] = levels
  it('A1: 4 unidades × 3 lecciones', () => {
    expect(a1.units.length).toBe(4)
    a1.units.forEach((u) => expect(u.lessons.length).toBe(3))
  })
  it('A2: 2 unidades × 2 lecciones jugables', () => {
    expect(a2.units.length).toBe(2)
    a2.units.forEach((u) => expect(u.lessons.length).toBe(2))
  })
  it('B1: 1 unidad jugable con 1 lección + unidades "próximamente"', () => {
    expect(b1.units.length).toBeGreaterThanOrEqual(2)
    expect(b1.units[0].lessons.length).toBe(1)
    expect(b1.units.slice(1).every((u) => u.comingSoon)).toBe(true)
  })
  it('test de nivel: 8 preguntas p1..p8', () => {
    expect(placementTest.map((e) => e.id)).toEqual(['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8'])
    placementTest.forEach((e) => checkExercise(e, 'placement'))
  })
})
