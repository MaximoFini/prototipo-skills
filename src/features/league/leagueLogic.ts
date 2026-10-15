import type { LeagueEntry, LeagueState } from '@/domain/types'
import { DAY, addDays } from '@/domain/clock'
import { BOT_POOL, LEAGUE_TIERS } from '@/data/bots'

export const LEAGUE_SIZE = 30
export const PROMOTE_COUNT = 10
export const DEMOTE_COUNT = 5
export const WEEK_MS = 7 * DAY
export const MAX_TIER = LEAGUE_TIERS.length - 1

export type Zone = 'promote' | 'safe' | 'demote'

// ---------- Hash / azar determinístico ----------
function hashStr(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}
/** Número en [0,1) determinístico a partir de un texto. */
export function hash01(s: string): number {
  let t = (hashStr(s) + 0x6d2b79f5) >>> 0
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

/** Lunes 00:00 (hora local) de una clave YYYY-MM-DD, en ms. */
export function weekStartMs(key: string): number {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d).getTime()
}

// ---------- Bots ----------
/** XP semanal esperado para un bot de `tier` (según su personalidad, derivada de su id). */
export function botWeeklyTarget(botId: string, tier: number): number {
  const p = hash01(`${botId}:p`)
  return Math.round((100 + 90 * tier) * (0.3 + 1.7 * p * p + 0.4 * p))
}

/**
 * XP de un bot tras `elapsedMs` desde el lunes 00:00. Determinística, monótona y con ruido por hora
 * (derivado del id, que incluye la seed). Duermen de noche: de 0 a 7 h casi no suman.
 */
export function botXpAt(bot: { id: string }, elapsedMs: number, tier: number): number {
  const e = Math.max(0, Math.min(elapsedMs, WEEK_MS))
  const weekly = botWeeklyTarget(bot.id, tier)
  const base = weekly / 168
  const fullHours = Math.floor(e / 3_600_000)
  const frac = (e % 3_600_000) / 3_600_000
  const inc = (h: number) => {
    const hod = h % 24
    const sleep = hod < 7 ? 0.08 : hod >= 22 ? 0.4 : 1.15
    return base * sleep * (0.15 + 1.7 * hash01(`${bot.id}:${h}`))
  }
  let xp = 0
  for (let h = 0; h < fullHours; h++) xp += inc(h)
  if (fullHours < 168) xp += inc(fullHours) * frac
  return Math.round(xp)
}

// ---------- Tabla ----------
function shuffled<T>(arr: T[], seed: string): T[] {
  return arr
    .map((x, i) => ({ x, k: hash01(`${seed}:${i}`) }))
    .sort((a, b) => a.k - b.k)
    .map((o) => o.x)
}

/** 30 participantes: el usuario + 29 bots con XP acorde a `elapsedMs` de la semana. */
export function createStandings(
  tier: number,
  userName: string,
  userAvatar: string,
  weekStartKey: string,
  seed: number | string,
  elapsedMs = 0,
): LeagueEntry[] {
  const tag = `${seed}:${weekStartKey}:${tier}`
  const bots = shuffled(BOT_POOL, tag).slice(0, LEAGUE_SIZE - 1)
  const entries: LeagueEntry[] = bots.map((b, i) => {
    const id = `bot-${tag}-${i}`
    return { id, name: b.name, avatar: b.avatar, xp: botXpAt({ id }, elapsedMs, tier), isUser: false }
  })
  entries.push({ id: 'user', name: userName, avatar: userAvatar, xp: 0, isUser: true })
  return entries
}

/** Ordena por XP desc; en empate el usuario queda adelante y después por nombre. */
export function rank(standings: LeagueEntry[]): LeagueEntry[] {
  return [...standings].sort((a, b) => b.xp - a.xp || Number(b.isUser) - Number(a.isUser) || a.name.localeCompare(b.name, 'es'))
}

/** Posición (1..N) del usuario. */
export function userRank(standings: LeagueEntry[]): number {
  return rank(standings).findIndex((e) => e.isUser) + 1
}

export function zoneOf(position: number, total = LEAGUE_SIZE): Zone {
  if (position <= PROMOTE_COUNT) return 'promote'
  if (position > total - DEMOTE_COUNT) return 'demote'
  return 'safe'
}

/** Pone a los bots al XP que les corresponde a `elapsedMs` (sin retroceder) y al usuario en `weekXp`. */
export function syncStandings(state: LeagueState, elapsedMs: number): LeagueState {
  const standings = state.standings.map((e) =>
    e.isUser ? { ...e, xp: state.weekXp } : { ...e, xp: Math.max(e.xp, botXpAt(e, elapsedMs, state.tier)) },
  )
  return { ...state, standings }
}

/**
 * Cierra la semana: top 10 sube, últimos 5 bajan (con topes en Rubí / Bronce).
 * `nextWeekStart` = lunes de la semana que arranca (por defecto, +7 días).
 */
export function closeWeek(state: LeagueState, nextWeekStart?: string, nextElapsedMs = 0): LeagueState {
  const user = state.standings.find((e) => e.isUser)
  const position = userRank(state.standings.map((e) => (e.isUser ? { ...e, xp: state.weekXp } : e))) || LEAGUE_SIZE
  const zone = zoneOf(position, state.standings.length || LEAGUE_SIZE)
  const from = state.tier
  const to = zone === 'promote' ? Math.min(MAX_TIER, from + 1) : zone === 'demote' ? Math.max(0, from - 1) : from
  const outcome: 'promoted' | 'demoted' | 'stayed' = to > from ? 'promoted' : to < from ? 'demoted' : 'stayed'
  const weekStart = nextWeekStart ?? addDays(state.weekStart, 7)
  return {
    tier: to,
    weekStart,
    weekXp: 0,
    standings: createStandings(to, user?.name ?? 'Vos', user?.avatar ?? 'a1', weekStart, hashStr(`${state.weekStart}:${from}:${position}`) % 100000, nextElapsedMs),
    lastResult: { from, to, rank: position, outcome },
  }
}

// ---------- Texto ----------
export function tierName(tier: number): string {
  return LEAGUE_TIERS[Math.max(0, Math.min(MAX_TIER, tier))].name
}

/** ms que faltan hasta el domingo 23:59:59 de la semana que arrancó en `weekStartKey`. */
export function msToWeekEnd(weekStartKey: string, nowMs: number): number {
  return Math.max(0, weekStartMs(weekStartKey) + WEEK_MS - 1000 - nowMs)
}

export function formatLeagueCountdown(ms: number): string {
  const total = Math.floor(ms / 1000)
  const d = Math.floor(total / 86400)
  const h = Math.floor((total % 86400) / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  if (d > 0) return `${d}d ${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m`
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`
  return `${m}:${String(s).padStart(2, '0')}`
}
