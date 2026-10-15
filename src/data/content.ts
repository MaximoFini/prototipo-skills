import type { Level, Lesson, Unit, LevelId, Exercise } from '@/domain/types'
import { a1Units } from './levels/a1'
import { a2Units } from './levels/a2'
import { b1Units } from './levels/b1'
import { placementTest } from './levels/placement'

export const levels: Level[] = [
  { id: 'A1', name: 'A1 Starter', units: a1Units },
  { id: 'A2', name: 'A2 Elementary', units: a2Units },
  { id: 'B1', name: 'B1 Intermediate', units: b1Units },
]

export const allUnits: Unit[] = levels.flatMap((l) => l.units)
/** Orden lineal de todas las lecciones (define el desbloqueo secuencial). */
export const allLessons: Lesson[] = allUnits.filter((u) => !u.comingSoon).flatMap((u) => u.lessons)

const lessonIndex = new Map(allUnits.flatMap((u) => u.lessons.map((l) => [l.id, { lesson: l, unit: u }] as const)))

export function getLesson(id: string): Lesson | undefined {
  return lessonIndex.get(id)?.lesson
}
export function getUnitOfLesson(id: string): Unit | undefined {
  return lessonIndex.get(id)?.unit
}
export function getUnit(id: string): Unit | undefined {
  return allUnits.find((u) => u.id === id)
}

/** Primera lección no completada en el orden lineal (la "activa" del mapa). */
export function currentLessonId(completed: Record<string, unknown>): string | null {
  return allLessons.find((l) => !completed[l.id])?.id ?? null
}
/** Una lección está desbloqueada si es la actual o ya se completó (o todas las anteriores). */
export function isLessonUnlocked(lessonId: string, completed: Record<string, unknown>): boolean {
  const idx = allLessons.findIndex((l) => l.id === lessonId)
  if (idx < 0) return false
  return allLessons.slice(0, idx).every((l) => completed[l.id])
}

export { placementTest }
/** Dado el número de aciertos por nivel del test, devuelve el nivel inicial. */
export function placementLevelFor(correctIds: string[]): LevelId {
  const n = (prefix: string[]) => prefix.filter((id) => correctIds.includes(id)).length
  const a2 = n(['p4', 'p5', 'p6'])
  const b1 = n(['p7', 'p8'])
  if (b1 >= 2 && a2 >= 2) return 'B1'
  if (a2 >= 2) return 'A2'
  return 'A1'
}

export function exerciseById(lessonId: string, exId: string): Exercise | undefined {
  return getLesson(lessonId)?.exercises.find((e) => e.id === exId)
}
