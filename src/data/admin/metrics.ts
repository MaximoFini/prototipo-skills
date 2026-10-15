import { addDays, today } from '@/domain/clock'
import { commissions as ALL_COMMISSIONS, teachers as ALL_TEACHERS, CHALLENGE_DAYS } from './students'
import type { AdminStudent, Commission, Level, PrizeType, RiskLevel, StudentStatus, Teacher } from './types'

/* ---------- Riesgo y estado ---------- */

/** Nivel de riesgo: días sin practicar, con agravante si perdió una racha larga. */
export function riskLevel(s: Pick<AdminStudent, 'daysInactive' | 'lostStreak'>): RiskLevel {
  if (s.daysInactive >= 5 || (s.daysInactive >= 3 && s.lostStreak >= 7)) return 'alto'
  if (s.daysInactive >= 3 || (s.daysInactive >= 2 && s.lostStreak >= 3)) return 'medio'
  return 'bajo'
}
export function studentStatus(s: Pick<AdminStudent, 'daysInactive'>): StudentStatus {
  if (s.daysInactive >= 10) return 'inactivo'
  if (s.daysInactive >= 3) return 'en_riesgo'
  return 'activo'
}
export function isAtRisk(s: AdminStudent): boolean {
  return riskLevel(s) !== 'bajo'
}
export const RISK_LABEL: Record<RiskLevel, string> = { bajo: 'Riesgo bajo', medio: 'Riesgo medio', alto: 'Riesgo alto' }
export const STATUS_LABEL: Record<StudentStatus, string> = { activo: 'Activo', en_riesgo: 'En riesgo', inactivo: 'Inactivo' }
const RISK_ORDER: Record<RiskLevel, number> = { alto: 2, medio: 1, bajo: 0 }

export function atRiskStudents(list: AdminStudent[]): AdminStudent[] {
  return list
    .filter(isAtRisk)
    .sort((a, b) => RISK_ORDER[riskLevel(b)] - RISK_ORDER[riskLevel(a)] || b.daysInactive - a.daysInactive || b.lostStreak - a.lostStreak)
}

/* ---------- KPIs ---------- */

export function avg(nums: number[]): number {
  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0
}
export const countActive = (list: AdminStudent[], days: number) => list.filter((s) => s.daysInactive < days).length

/** Retención en vacaciones: dato demo (con Skills Go vs. año anterior sin app). */
export const RETENTION = { current: 82, previous: 61, reenrollCurrent: 88, reenrollPrevious: 71 }

export interface Kpis {
  total: number
  activeToday: number
  activeWeek: number
  activeMonth: number
  avgStreak: number
  lessonsPerDay: number
  xpWeek: number
  inChallenge: number
}
export function computeKpis(list: AdminStudent[]): Kpis {
  const lastWeekLessons = list.reduce((a, s) => a + s.history.slice(-7).reduce((x, y) => x + y, 0), 0)
  return {
    total: list.length,
    activeToday: countActive(list, 1),
    activeWeek: countActive(list, 7),
    activeMonth: countActive(list, 30),
    avgStreak: Math.round(avg(list.map((s) => s.streak)) * 10) / 10,
    lessonsPerDay: Math.round((lastWeekLessons / 7) * 10) / 10,
    xpWeek: list.reduce((a, s) => a + s.xpWeek, 0),
    inChallenge: list.filter((s) => s.vacation.enrolled).length,
  }
}

/* ---------- Series para gráficos ---------- */

export interface DayPoint { date: string; label: string; active: number; lessons: number }
const fmtDay = (key: string) => {
  const [, m, d] = key.split('-')
  return `${Number(d)}/${Number(m)}`
}
export function dailyActivity(list: AdminStudent[], days = 30, ref: string = today()): DayPoint[] {
  return Array.from({ length: days }, (_, i) => {
    const ago = days - 1 - i
    const idx = (list[0]?.history.length ?? 60) - 1 - ago
    const date = addDays(ref, -ago)
    return {
      date,
      label: fmtDay(date),
      active: list.filter((s) => (s.history[idx] ?? 0) > 0).length,
      lessons: list.reduce((a, s) => a + (s.history[idx] ?? 0), 0),
    }
  })
}

export const STREAK_BUCKETS: { label: string; min: number; max: number }[] = [
  { label: 'Sin racha', min: 0, max: 0 },
  { label: '1–2', min: 1, max: 2 },
  { label: '3–6', min: 3, max: 6 },
  { label: '7–13', min: 7, max: 13 },
  { label: '14–20', min: 14, max: 20 },
  { label: '21+', min: 21, max: Infinity },
]
export function streakHistogram(list: AdminStudent[]) {
  return STREAK_BUCKETS.map((b) => ({ label: b.label, alumnos: list.filter((s) => s.streak >= b.min && s.streak <= b.max).length }))
}

/** Retención semanal por cohorte (% que sigue practicando). Datos demo. */
export const retentionSeries = [
  { semana: 'Sem 1', conApp: 100, anioAnterior: 100 },
  { semana: 'Sem 2', conApp: 96, anioAnterior: 90 },
  { semana: 'Sem 3', conApp: 93, anioAnterior: 82 },
  { semana: 'Sem 4', conApp: 90, anioAnterior: 75 },
  { semana: 'Sem 5', conApp: 87, anioAnterior: 69 },
  { semana: 'Sem 6', conApp: 85, anioAnterior: 65 },
  { semana: 'Sem 7', conApp: 83, anioAnterior: 63 },
  { semana: 'Sem 8', conApp: RETENTION.current, anioAnterior: RETENTION.previous },
]

/* ---------- Comisiones y docentes ---------- */

export interface GroupStats {
  id: string
  name: string
  students: number
  activeWeekPct: number
  avgStreak: number
  xpWeek: number
  atRisk: number
}
function groupStats(id: string, name: string, list: AdminStudent[]): GroupStats {
  return {
    id,
    name,
    students: list.length,
    activeWeekPct: list.length ? Math.round((countActive(list, 7) / list.length) * 100) : 0,
    avgStreak: Math.round(avg(list.map((s) => s.streak)) * 10) / 10,
    xpWeek: list.reduce((a, s) => a + s.xpWeek, 0),
    atRisk: list.filter(isAtRisk).length,
  }
}
export function commissionStats(list: AdminStudent[], comms: Commission[] = ALL_COMMISSIONS): GroupStats[] {
  return comms
    .map((c) => groupStats(c.id, c.name, list.filter((s) => s.commissionId === c.id)))
    .sort((a, b) => b.activeWeekPct - a.activeWeekPct || b.avgStreak - a.avgStreak)
}
export function teacherStats(list: AdminStudent[], teachers: Teacher[] = ALL_TEACHERS): (GroupStats & { commissions: string[] })[] {
  return teachers
    .map((t) => ({
      ...groupStats(t.id, t.name, list.filter((s) => s.teacherId === t.id)),
      commissions: ALL_COMMISSIONS.filter((c) => c.teacherId === t.id).map((c) => c.name),
    }))
    .filter((t) => t.students > 0)
    .sort((a, b) => b.activeWeekPct - a.activeWeekPct || b.avgStreak - a.avgStreak)
}

/* ---------- Campaña ---------- */

export const PRIZE_LABEL: Record<PrizeType, string> = {
  merch: 'Merch Skills (remera)',
  clase: 'Clase de conversación gratis',
  descuento: '10 % de descuento en cuota',
  evento: 'Entrada a evento Skills',
}
/** Precios ficticios (ARS) de demostración. */
export const PRIZE_COST: Record<PrizeType, number> = { merch: 6500, clase: 12000, descuento: 6000, evento: 8000 }
export const MONTHLY_FEE = 60000

export function campaignStats(list: AdminStudent[]) {
  const enrolled = list.filter((s) => s.vacation.enrolled)
  const reach = ([7, 14, 21] as const).map((m) => {
    const n = enrolled.filter((s) => s.vacation.bestRun >= m).length
    return { milestone: m, students: n, pct: enrolled.length ? Math.round((n / enrolled.length) * 100) : 0 }
  })
  const prizes = (Object.keys(PRIZE_LABEL) as PrizeType[]).map((type) => {
    const all = enrolled.flatMap((s) => s.vacation.prizes).filter((p) => p.type === type)
    const redeemed = all.filter((p) => p.redeemed).length
    return { type, label: PRIZE_LABEL[type], delivered: all.length, redeemed, cost: redeemed * PRIZE_COST[type] }
  })
  const totalCost = prizes.reduce((a, p) => a + p.cost, 0)
  const retainedExtra = Math.round(list.length * ((RETENTION.current - RETENTION.previous) / 100))
  const monthlyReturn = retainedExtra * MONTHLY_FEE
  return {
    enrolled: enrolled.length,
    enrolledPct: list.length ? Math.round((enrolled.length / list.length) * 100) : 0,
    onTrack: enrolled.filter((s) => s.vacation.day > 0).length,
    completed: enrolled.filter((s) => s.vacation.bestRun >= CHALLENGE_DAYS).length,
    reach,
    prizes,
    totalCost,
    retainedExtra,
    monthlyReturn,
    roi: totalCost > 0 ? Math.round((monthlyReturn / totalCost) * 10) / 10 : 0,
  }
}

/* ---------- Filtros y orden ---------- */

export interface StudentFilters { q?: string; commission?: string; level?: Level | ''; status?: StudentStatus | '' }
const norm = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
export function filterStudents(list: AdminStudent[], f: StudentFilters): AdminStudent[] {
  const q = norm(f.q?.trim() ?? '')
  return list.filter(
    (s) =>
      (!q || norm(s.name).includes(q)) &&
      (!f.commission || s.commissionId === f.commission) &&
      (!f.level || s.level === f.level) &&
      (!f.status || studentStatus(s) === f.status),
  )
}
export type SortKey = 'name' | 'streak' | 'xpWeek' | 'daysInactive'
export function sortStudents(list: AdminStudent[], key: SortKey, dir: 'asc' | 'desc'): AdminStudent[] {
  const m = dir === 'asc' ? 1 : -1
  return [...list].sort((a, b) => (key === 'name' ? a.name.localeCompare(b.name, 'es') * m : (a[key] - b[key]) * m || a.name.localeCompare(b.name, 'es')))
}

/* ---------- CSV ---------- */

function cell(v: string | number): string {
  const t = String(v)
  return /[";\n\r]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t
}
/** CSV separado por `;` (abre bien en Excel en español) con BOM UTF-8. */
export function toCsv(headers: string[], rows: (string | number)[][]): string {
  return '﻿' + [headers, ...rows].map((r) => r.map(cell).join(';')).join('\r\n')
}
export function studentsCsv(list: AdminStudent[]): string {
  return toCsv(
    ['Alumno', 'Edad', 'Comisión', 'Nivel', 'Racha actual', 'Mejor racha', 'XP semanal', 'XP total', 'Días sin practicar', 'Última actividad', 'Estado', 'Riesgo', 'Desafío de Vacaciones'],
    list.map((s) => [s.name, s.age, s.commission, s.level, s.streak, s.bestStreak, s.xpWeek, s.xpTotal, s.daysInactive, s.lastActiveDate, STATUS_LABEL[studentStatus(s)], RISK_LABEL[riskLevel(s)], s.vacation.enrolled ? `Día ${s.vacation.day} de ${CHALLENGE_DAYS}` : 'No inscripto']),
  )
}
export function riskCsv(list: AdminStudent[], contacted: ReadonlySet<number> = new Set()): string {
  return toCsv(
    ['Alumno', 'Comisión', 'Días sin practicar', 'Racha perdida', 'Última actividad', 'Nivel de riesgo', 'Contactado'],
    list.map((s) => [s.name, s.commission, s.daysInactive, s.lostStreak, s.lastActiveDate, RISK_LABEL[riskLevel(s)], contacted.has(s.id) ? 'Sí' : 'No']),
  )
}
export function downloadCsv(filename: string, content: string): void {
  const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/* ---------- Mensajes ---------- */

export const DEFAULT_TEMPLATE = '¡Hola {nombre}! Te extrañamos en Skills Go. Tu racha de {n} días te espera. ¿Retomamos hoy?'
export function firstName(full: string): string {
  return full.split(' ')[0] === 'Juan' ? 'Juan Cruz' : full.split(' ')[0]
}
export function fillTemplate(tpl: string, s: AdminStudent): string {
  const n = s.lostStreak || s.bestStreak
  return tpl.replaceAll('{nombre}', firstName(s.name)).replaceAll('{n}', String(n))
}
