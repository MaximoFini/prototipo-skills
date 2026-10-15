import { addDays, today } from '@/domain/clock'
import { createRng, type Rng } from './prng'
import type { AdminStudent, Commission, Level, Milestone, PrizeType, StudentPrize, Teacher } from './types'

export const HISTORY_DAYS = 60
export const CHALLENGE_DAYS = 21

export const teachers: Teacher[] = [
  { id: 't1', name: 'Lucía Ferreyra' },
  { id: 't2', name: 'Martín Quiroga' },
  { id: 't3', name: 'Carolina Bustos' },
  { id: 't4', name: 'Gonzalo Ledesma' },
  { id: 't5', name: 'Verónica Aguirre' },
  { id: 't6', name: 'Sebastián Paredes' },
]

export const commissions: Commission[] = [
  { id: 'c1', name: 'Teens 1A', teacherId: 't1', ageMin: 13, ageMax: 14 },
  { id: 'c2', name: 'Teens 1B', teacherId: 't2', ageMin: 13, ageMax: 14 },
  { id: 'c3', name: 'Teens 2A', teacherId: 't3', ageMin: 14, ageMax: 16 },
  { id: 'c4', name: 'Teens 2B', teacherId: 't4', ageMin: 14, ageMax: 16 },
  { id: 'c5', name: 'Juniors A', teacherId: 't1', ageMin: 12, ageMax: 13 },
  { id: 'c6', name: 'Juniors B', teacherId: 't3', ageMin: 12, ageMax: 13 },
  { id: 'c7', name: 'Advanced 1', teacherId: 't5', ageMin: 16, ageMax: 18 },
  { id: 'c8', name: 'Advanced 2', teacherId: 't6', ageMin: 16, ageMax: 18 },
]
/** Nivel base (avance en unidades) por comisión. */
const BASE_FRONTIER: Record<string, number> = { c1: 0.8, c2: 0.6, c3: 1.8, c4: 1.6, c5: 0.2, c6: 0.3, c7: 3.6, c8: 3.2 }

const FIRST = ['Valentina', 'Santiago', 'Martina', 'Mateo', 'Sofía', 'Benjamín', 'Camila', 'Thiago', 'Lucía', 'Joaquín', 'Julieta', 'Bautista', 'Emma', 'Facundo', 'Agustina', 'Lautaro', 'Catalina', 'Nicolás', 'Milagros', 'Tomás', 'Delfina', 'Franco', 'Abril', 'Ignacio', 'Renata', 'Lucas', 'Candela', 'Ramiro', 'Pilar', 'Gael', 'Florencia', 'Dante', 'Micaela', 'Juan Cruz', 'Bianca', 'Máximo', 'Antonella', 'Ezequiel', 'Morena', 'Felipe']
const LAST = ['González', 'Rodríguez', 'Fernández', 'López', 'Martínez', 'Pérez', 'Gómez', 'Sánchez', 'Díaz', 'Romero', 'Álvarez', 'Torres', 'Ruiz', 'Acosta', 'Benítez', 'Medina', 'Herrera', 'Suárez', 'Aguirre', 'Giménez', 'Molina', 'Castro', 'Ortiz', 'Silva', 'Rojas', 'Núñez', 'Luna', 'Cabrera', 'Ríos', 'Ferreyra', 'Bustos', 'Quiroga', 'Peralta', 'Vega', 'Ledesma', 'Funes', 'Sosa', 'Videla', 'Heredia', 'Villarreal']

const PRIZE_BY_MILESTONE: Record<Milestone, PrizeType[]> = { 7: ['merch'], 14: ['clase'], 21: ['descuento', 'evento'] }

/** Mayor tramo seguido de días con actividad dentro de `arr`. */
export function longestRun(arr: number[]): number {
  let best = 0
  let cur = 0
  for (const v of arr) {
    cur = v > 0 ? cur + 1 : 0
    if (cur > best) best = cur
  }
  return best
}
/** Racha vigente: tramo que termina hoy, o ayer (todavía no se cortó). */
export function currentStreakOf(history: number[]): { streak: number; daysInactive: number } {
  let i = history.length - 1
  while (i >= 0 && history[i] === 0) i--
  const daysInactive = i < 0 ? history.length : history.length - 1 - i
  let run = 0
  for (let j = i; j >= 0 && history[j] > 0; j--) run++
  return { streak: daysInactive <= 1 ? run : 0, daysInactive }
}
function runEndingAt(history: number[], idx: number): number {
  let run = 0
  for (let j = idx; j >= 0 && history[j] > 0; j--) run++
  return run
}

type Archetype = 'constante' | 'regular' | 'esporadico' | 'abandona'
function makeHistory(rng: Rng, arch: Archetype): number[] {
  const p = arch === 'constante' ? 0.94 : arch === 'regular' ? 0.7 : arch === 'esporadico' ? 0.38 : 0.86
  const dropAgo = arch === 'abandona' ? rng.int(2, 16) : 0
  const h: number[] = []
  for (let i = 0; i < HISTORY_DAYS; i++) {
    const ago = HISTORY_DAYS - 1 - i
    const active = arch === 'abandona' && ago < dropAgo ? false : rng.chance(p)
    h.push(active ? 1 + (rng.chance(0.45) ? 1 : 0) + (rng.chance(0.15) ? 1 : 0) : 0)
  }
  return h
}

export function generateStudents(refDay: string = today(), seed = 20261015): AdminStudent[] {
  const rng = createRng(seed)
  const out: AdminStudent[] = []
  const used = new Set<string>()
  let id = 1
  for (const c of commissions) {
    for (let k = 0; k < 15; k++) {
      let name = ''
      do name = `${rng.pick(FIRST)} ${rng.pick(LAST)}`
      while (used.has(name))
      used.add(name)
      const r = rng.next()
      const arch: Archetype = r < 0.45 ? 'constante' : r < 0.7 ? 'regular' : r < 0.82 ? 'esporadico' : 'abandona'
      const history = makeHistory(rng, arch)
      const { streak, daysInactive } = currentStreakOf(history)
      const lastIdx = history.length - 1 - daysInactive
      const lostStreak = daysInactive >= 2 && lastIdx >= 0 ? runEndingAt(history, lastIdx) : 0
      const sum = history.reduce((a, b) => a + b, 0)
      const frontier = Math.min(7, BASE_FRONTIER[c.id] + rng.next() * 1.2 + sum / 22)
      const level: Level = frontier < 4 ? 'A1' : frontier < 6 ? 'A2' : 'B1'
      const unitProgress = Array.from({ length: 7 }, (_, i) => Math.round(Math.max(0, Math.min(1, frontier - i)) * 100))
      const xpWeek = history.slice(-7).reduce((a, b) => a + b, 0) * 13
      const window = history.slice(-CHALLENGE_DAYS)
      const enrolled = arch === 'esporadico' ? rng.chance(0.5) : rng.chance(0.88)
      const bestRun = enrolled ? longestRun(window) : 0
      const milestones = ([7, 14, 21] as Milestone[]).filter((m) => bestRun >= m)
      const prizes: StudentPrize[] = milestones.flatMap((m) =>
        PRIZE_BY_MILESTONE[m].map((type) => ({
          type,
          milestone: m,
          code: `SG-${String(id).padStart(3, '0')}-${m}${type[0].toUpperCase()}`,
          redeemed: rng.chance(m === 7 ? 0.7 : m === 14 ? 0.55 : 0.4),
        })),
      )
      out.push({
        id,
        name,
        age: rng.int(c.ageMin, c.ageMax),
        commissionId: c.id,
        commission: c.name,
        teacherId: c.teacherId,
        level,
        streak,
        bestStreak: Math.max(longestRun(history), streak) + (arch === 'constante' ? rng.int(0, 6) : 0),
        lostStreak,
        xpWeek,
        xpTotal: rng.int(150, 1400) + sum * 13,
        daysInactive,
        lastActiveDate: addDays(refDay, -daysInactive),
        lessonsCompleted: sum + rng.int(0, 12),
        history,
        unitProgress,
        vacation: { enrolled, day: enrolled ? Math.min(streak, CHALLENGE_DAYS) : 0, bestRun, milestones, prizes },
      })
      id++
    }
  }
  return out
}

export const students: AdminStudent[] = generateStudents()
