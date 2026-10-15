import { on } from '@/domain/events'
import { now, today, weekStart } from '@/domain/clock'
import { useApp } from '@/store/useApp'
import { LEAGUE_TIERS } from '@/data/bots'
import { notifTexts } from '@/features/demo/notifTexts'
import { MAX_TIER, WEEK_MS, closeWeek, createStandings, syncStandings, weekStartMs } from './leagueLogic'
import { bumpLeagueClose } from './seen'

/** En el demo los bots "viven más rápido" mientras mirás la liga: ms de semana extra acumulados. */
let liveBoostMs = 0
export function addLiveBoost(ms: number) {
  liveBoostMs += ms
}

function elapsedNow(weekStartKey: string): number {
  return Math.max(0, Math.min(WEEK_MS, now() - weekStartMs(weekStartKey) + liveBoostMs))
}

/** Pone al día el XP de los bots (según el tiempo transcurrido de la semana). */
export function syncLeagueBots() {
  const { league, patch } = useApp.getState()
  if (!league.standings.length) return
  patch({ league: syncStandings(league, elapsedNow(league.weekStart)) })
}

/** Crea la tabla si falta y mantiene nombre/avatar del usuario sincronizados con el perfil. */
function ensureLeague() {
  const s = useApp.getState()
  const { name, avatar } = s.profile
  if (!name) return
  const { league } = s
  if (!league.standings.length) {
    const ws = weekStart(today())
    liveBoostMs = 0
    const standings = createStandings(league.tier, name, avatar, ws, Math.floor(s.profile.createdAt % 100000), Math.max(0, now() - weekStartMs(ws)))
    s.patch({ league: { ...league, weekStart: ws, standings: standings.map((e) => (e.isUser ? { ...e, xp: league.weekXp } : e)) } })
    return
  }
  const user = league.standings.find((e) => e.isUser)
  if (user && (user.name !== name || user.avatar !== avatar)) {
    s.patch({ league: { ...league, standings: league.standings.map((e) => (e.isUser ? { ...e, name, avatar } : e)) } })
  }
}

function finishWeek(forced: boolean) {
  const s = useApp.getState()
  const { league } = s
  if (!league.standings.length) return
  // Semana natural: los bots llegaron al domingo; forzada (demo): cierra con lo que lleva cada uno.
  const synced = syncStandings(league, forced ? elapsedNow(league.weekStart) : WEEK_MS)
  const nextWs = weekStart(today())
  const nextElapsed = Math.max(0, now() - weekStartMs(nextWs))
  liveBoostMs = 0
  const closed = closeWeek(synced, nextWs, nextElapsed)
  bumpLeagueClose()
  const patchAch = closed.tier >= 2 && league.tier < 2
  s.patch((st) => ({
    league: closed,
    ...(patchAch && (st.achievements['gold-league']?.level ?? 0) < 1
      ? { achievements: { ...st.achievements, 'gold-league': { level: 1, unlockedAt: now() } } }
      : {}),
  }))
  const r = closed.lastResult
  if (r?.outcome === 'promoted') s.pushNotification(notifTexts.leaguePromotion(LEAGUE_TIERS[Math.min(MAX_TIER, r.to)].name))
  else if (r?.outcome === 'demoted') s.pushNotification(notifTexts.leagueDemotion(LEAGUE_TIERS[Math.max(0, r.to)].name))
}

function checkWeek() {
  const { league } = useApp.getState()
  if (league.standings.length && league.weekStart !== weekStart(today())) finishWeek(false)
}

let registered = false
export function registerLeague() {
  if (registered) return
  registered = true
  ensureLeague()
  checkWeek()
  on('xp-gained', ({ amount }) => {
    ensureLeague()
    const { league, patch } = useApp.getState()
    if (!league.standings.length || amount <= 0) return
    const weekXp = league.weekXp + amount
    patch({ league: { ...league, weekXp, standings: league.standings.map((e) => (e.isUser ? { ...e, xp: weekXp } : e)) } })
  })
  on('day-changed', checkWeek)
  // Cubre onboarding, reset, perfiles de demo y saltos de días.
  useApp.subscribe(() => {
    ensureLeague()
    checkWeek()
  })
}

/** Cierra la semana ya (lo usa el panel de demo). */
export function closeLeagueWeek() {
  ensureLeague()
  finishWeek(true)
}
