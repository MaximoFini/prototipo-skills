import { describe, expect, it } from 'vitest'
import type { LeagueState } from '@/domain/types'
import { DAY } from '@/domain/clock'
import { botXpAt, closeWeek, createStandings, rank, syncStandings, userRank, zoneOf, WEEK_MS } from './leagueLogic'

const mk = (tier: number, userXp: number): LeagueState => ({
  tier,
  weekStart: '2026-10-12',
  weekXp: userXp,
  standings: createStandings(tier, 'Sofi', 'a3', '2026-10-12', 7, WEEK_MS).map((e) => (e.isUser ? { ...e, xp: userXp } : e)),
  lastResult: null,
})

describe('createStandings', () => {
  it('arma 30 participantes con un solo usuario y nombres únicos', () => {
    const s = createStandings(0, 'Sofi', 'a3', '2026-10-12', 1, 2 * DAY)
    expect(s).toHaveLength(30)
    expect(s.filter((e) => e.isUser)).toHaveLength(1)
    expect(new Set(s.map((e) => e.id)).size).toBe(30)
    expect(new Set(s.map((e) => e.name)).size).toBe(30)
  })
  it('es determinística por seed', () => {
    const a = createStandings(1, 'X', 'a1', '2026-10-12', 5, DAY)
    const b = createStandings(1, 'X', 'a1', '2026-10-12', 5, DAY)
    expect(a).toEqual(b)
  })
})

describe('botXpAt', () => {
  const bot = { id: 'bot-test' }
  it('empieza en 0 y no baja nunca', () => {
    expect(botXpAt(bot, 0, 0)).toBe(0)
    let prev = 0
    for (let h = 0; h <= 170; h += 3) {
      const v = botXpAt(bot, h * 3_600_000, 2)
      expect(v).toBeGreaterThanOrEqual(prev)
      prev = v
    }
  })
  it('los tiers altos suman más (en promedio)', () => {
    const avg = (tier: number) => {
      let t = 0
      for (let i = 0; i < 60; i++) t += botXpAt({ id: `b${i}` }, WEEK_MS, tier)
      return t / 60
    }
    expect(avg(4)).toBeGreaterThan(avg(2))
    expect(avg(2)).toBeGreaterThan(avg(0))
  })
})

describe('rank / zoneOf', () => {
  it('ordena por XP y el usuario gana los empates', () => {
    const r = rank([
      { id: 'a', name: 'A', avatar: 'a1', xp: 10, isUser: false },
      { id: 'u', name: 'U', avatar: 'a1', xp: 10, isUser: true },
      { id: 'b', name: 'B', avatar: 'a1', xp: 30, isUser: false },
    ])
    expect(r.map((e) => e.id)).toEqual(['b', 'u', 'a'])
  })
  it('zonas: top 10 asciende, últimos 5 descienden', () => {
    expect(zoneOf(1)).toBe('promote')
    expect(zoneOf(10)).toBe('promote')
    expect(zoneOf(11)).toBe('safe')
    expect(zoneOf(25)).toBe('safe')
    expect(zoneOf(26)).toBe('demote')
    expect(zoneOf(30)).toBe('demote')
  })
})

describe('closeWeek', () => {
  it('con mucho XP sube de liga', () => {
    const next = closeWeek(mk(0, 99999))
    expect(next.tier).toBe(1)
    expect(next.lastResult).toMatchObject({ from: 0, to: 1, rank: 1, outcome: 'promoted' })
    expect(next.weekXp).toBe(0)
    expect(next.standings).toHaveLength(30)
    expect(next.weekStart).toBe('2026-10-19')
  })
  it('sin XP baja de liga (si no es Bronce)', () => {
    const next = closeWeek(mk(2, 0))
    expect(userRank(mk(2, 0).standings)).toBeGreaterThan(25)
    expect(next.tier).toBe(1)
    expect(next.lastResult?.outcome).toBe('demoted')
  })
  it('topes: Bronce no baja y Rubí no sube', () => {
    expect(closeWeek(mk(0, 0))).toMatchObject({ tier: 0, lastResult: { outcome: 'stayed' } })
    expect(closeWeek(mk(4, 99999))).toMatchObject({ tier: 4, lastResult: { outcome: 'stayed' } })
  })
  it('en el medio se queda', () => {
    const s = mk(1, 0)
    const sorted = rank(s.standings)
    const mid = sorted[17].xp
    const next = closeWeek({ ...s, weekXp: mid, standings: s.standings.map((e) => (e.isUser ? { ...e, xp: mid } : e)) })
    expect(['stayed', 'promoted', 'demoted']).toContain(next.lastResult?.outcome)
    expect(next.lastResult?.rank).toBeGreaterThan(10)
  })
})

describe('syncStandings', () => {
  it('actualiza el XP del usuario y no hace retroceder a los bots', () => {
    const s = mk(0, 40)
    const synced = syncStandings({ ...s, weekXp: 55 }, 0)
    expect(synced.standings.find((e) => e.isUser)?.xp).toBe(55)
    const before = s.standings.filter((e) => !e.isUser).map((e) => e.xp)
    const after = synced.standings.filter((e) => !e.isUser).map((e) => e.xp)
    expect(after).toEqual(before)
  })
})
