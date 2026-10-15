// Reloj de la app. Permite "viajar en el tiempo" desde el panel de demo.
let offset = 0

export function setClockOffset(ms: number) {
  offset = ms
}
export function getClockOffset() {
  return offset
}
/** Timestamp actual de la app (ms). Usar SIEMPRE esto en vez de Date.now(). */
export function now(): number {
  return Date.now() + offset
}
export function dayKey(ts: number = now()): string {
  const d = new Date(ts)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}
/** YYYY-MM-DD de hoy según el reloj de la app. */
export function today(): string {
  return dayKey()
}
export function addDays(key: string, n: number): string {
  const [y, m, d] = key.split('-').map(Number)
  const dt = new Date(y, m - 1, d + n, 12)
  return dayKey(dt.getTime())
}
export function diffDays(a: string, b: string): number {
  const [ya, ma, da] = a.split('-').map(Number)
  const [yb, mb, db] = b.split('-').map(Number)
  return Math.round((Date.UTC(yb, mb - 1, db) - Date.UTC(ya, ma - 1, da)) / 86400000)
}
/** Lunes de la semana de `key` (la liga arranca los lunes). */
export function weekStart(key: string = today()): string {
  const [y, m, d] = key.split('-').map(Number)
  const dow = new Date(y, m - 1, d, 12).getDay() // 0 dom
  return addDays(key, -((dow + 6) % 7))
}
export const HOUR = 3600_000
export const DAY = 86400_000
