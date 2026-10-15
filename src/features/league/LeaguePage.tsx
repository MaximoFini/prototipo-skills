import { memo, useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowDown, ArrowUp, Clock } from 'lucide-react'
import { Avatar, Skilly } from '@/design'
import { useApp } from '@/store/useApp'
import { now } from '@/domain/clock'
import type { LeagueEntry } from '@/domain/types'
import { LEAGUE_TIERS } from '@/data/bots'
import { LEAGUE_SIZE, MAX_TIER, PROMOTE_COUNT, formatLeagueCountdown, msToWeekEnd, rank, zoneOf } from './leagueLogic'
import { addLiveBoost, syncLeagueBots } from './register'
import { isResultSeen, markResultSeen } from './seen'
import { LeagueEndScreen } from './LeagueEndScreen'
import { TierShield } from './TierShield'

const LIVE_TICK_MS = 4000
/** En el demo, cada tick equivale a unas horas de la semana para que se vea moverse el ranking. */
const LIVE_STEP_MS = 2.5 * 3_600_000

function Countdown({ weekStart }: { weekStart: string }) {
  const [, tick] = useState(0)
  useEffect(() => {
    const i = setInterval(() => tick((n) => n + 1), 1000)
    return () => clearInterval(i)
  }, [])
  return <span className="tabular-nums">{formatLeagueCountdown(msToWeekEnd(weekStart, now()))}</span>
}

function ZoneBand({ tone, children, icon }: { tone: 'up' | 'down' | 'neutral'; children: string; icon?: 'up' | 'down' }) {
  const cls = tone === 'up' ? 'bg-go-primary-tint text-go-primary' : tone === 'down' ? 'bg-go-danger-tint text-go-danger' : 'bg-go-surface text-go-muted'
  return (
    <div className={`flex items-center justify-center gap-2 px-4 py-2 font-display text-[12px] font-extrabold uppercase tracking-[0.1em] ${cls}`}>
      {icon === 'up' && <ArrowUp size={16} strokeWidth={3} aria-hidden />}
      {children}
      {icon === 'down' && <ArrowDown size={16} strokeWidth={3} aria-hidden />}
    </div>
  )
}

const Row = memo(function Row({ entry, pos, animate }: { entry: LeagueEntry; pos: number; animate: boolean }) {
  const medal = pos === 1 ? '#F2C94C' : pos === 2 ? '#C9D0D6' : pos === 3 ? '#D9985A' : null
  return (
    <motion.div
      role="listitem"
      layout={animate ? 'position' : false}
      transition={{ type: 'spring', damping: 26, stiffness: 320 }}
      className={`flex items-center gap-3 px-4 py-2.5 ${entry.isUser ? 'border-y-2 border-go-primary bg-go-primary-tint' : 'border-b border-go-border bg-white'}`}
      aria-label={`Puesto ${pos}, ${entry.name}, ${entry.xp} XP${entry.isUser ? ', vos' : ''}`}
    >
      <span
        className={`grid h-8 w-8 shrink-0 place-items-center rounded-full font-display text-[15px] font-extrabold ${medal ? 'text-go-text' : 'text-go-muted'}`}
        style={medal ? { background: medal } : undefined}
      >
        {pos}
      </span>
      <Avatar id={entry.avatar} name={entry.name} size={40} />
      <span className={`min-w-0 flex-1 truncate font-display text-[17px] font-extrabold ${entry.isUser ? 'text-go-primary' : 'text-go-text'}`}>
        {entry.isUser ? `${entry.name} (vos)` : entry.name}
      </span>
      <span className="font-display text-[16px] font-extrabold tabular-nums text-go-text">{entry.xp} <span className="text-[12px] font-bold text-go-muted">XP</span></span>
    </motion.div>
  )
})

export default function LeaguePage() {
  const league = useApp((s) => s.league)
  const reduce = useReducedMotion()
  const [resultVersion, setResultVersion] = useState(0)

  useEffect(() => {
    syncLeagueBots()
    const i = setInterval(() => {
      addLiveBoost(LIVE_STEP_MS)
      syncLeagueBots()
    }, LIVE_TICK_MS)
    return () => clearInterval(i)
  }, [])

  const result = league.lastResult
  const showEnd = !!result && !isResultSeen(league.weekStart)
  // `resultVersion` fuerza a re-evaluar tras marcar como visto
  void resultVersion

  if (showEnd && result) {
    return (
      <LeagueEndScreen
        result={result}
        onContinue={() => {
          markResultSeen(league.weekStart)
          setResultVersion((v) => v + 1)
        }}
      />
    )
  }

  const tier = LEAGUE_TIERS[league.tier]
  const nextName = LEAGUE_TIERS[Math.min(MAX_TIER, league.tier + 1)].name
  const standings = league.standings.map((e) => (e.isUser ? { ...e, xp: league.weekXp } : e))
  const sorted = rank(standings)
  const myPos = sorted.findIndex((e) => e.isUser) + 1
  const cutXp = sorted[PROMOTE_COUNT - 1]?.xp ?? 0
  const missing = Math.max(0, cutXp - league.weekXp + 1)

  return (
    <div className="flex h-full flex-col bg-white">
      <header className="shrink-0 border-b-2 border-go-border bg-go-surface px-4 pb-3 text-center" style={{ paddingTop: 'calc(14px + var(--safe-top))' }}>
        <div className="flex items-center justify-center gap-1.5" aria-label="Ligas">
          {LEAGUE_TIERS.map((t, i) => (
            <div key={t.name} className={i === league.tier ? 'scale-110' : 'opacity-90'} title={t.name}>
              <TierShield tier={i} size={i === league.tier ? 30 : 22} locked={i > league.tier} />
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center justify-center gap-3">
          <motion.div animate={reduce ? undefined : { y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut' }}>
            <TierShield tier={league.tier} size={72} />
          </motion.div>
          <div className="text-left">
            <h1 className="font-display text-[26px] font-extrabold leading-tight text-go-text">Liga {tier.name}</h1>
            <div className="flex items-center gap-1.5 text-[14px] font-bold text-go-muted">
              <Clock size={16} strokeWidth={2.5} aria-hidden /> Termina en <span className="text-go-danger"><Countdown weekStart={league.weekStart} /></span>
            </div>
          </div>
        </div>
        <p className="mt-2 text-[14px] text-go-muted">
          {league.tier < MAX_TIER ? <>Los 10 primeros suben a <b className="text-go-text">{nextName}</b></> : <>Los 10 primeros se quedan en <b className="text-go-text">Rubí</b>. ¡Leyendas!</>}
        </p>
      </header>

      {standings.length === 0 ? (
        <div className="grid flex-1 place-items-center p-6 text-center text-go-muted">
          <div><Skilly mood="sleepy" size={80} /><p className="mt-2">Armando tu liga…</p></div>
        </div>
      ) : (
        <div className="scroll-y flex-1">
          <div className="flex items-center gap-3 border-b border-go-border bg-white px-4 py-2.5 text-[14px]">
            <Skilly mood={myPos <= PROMOTE_COUNT ? 'wink' : 'think'} size={34} />
            <p className="flex-1 text-go-text">
              {myPos <= PROMOTE_COUNT
                ? <>Vas <b>#{myPos}</b>: estás en zona de ascenso. ¡No aflojes!</>
                : <>Vas <b>#{myPos}</b>. Te faltan <b>{missing} XP</b> para entrar al top 10.</>}
            </p>
          </div>
          <div role="list">
            {sorted.map((e, i) => {
              const pos = i + 1
              return (
                <div key={e.id}>
                  {pos === 1 && (league.tier < MAX_TIER ? <ZoneBand tone="up" icon="up">Zona de ascenso</ZoneBand> : <ZoneBand tone="up" icon="up">Top 10 · te quedás en Rubí</ZoneBand>)}
                  {pos === LEAGUE_SIZE - 4 && (league.tier > 0 ? <ZoneBand tone="down" icon="down">Zona de descenso</ZoneBand> : <ZoneBand tone="neutral">Últimos puestos</ZoneBand>)}
                  <Row entry={e} pos={pos} animate={!reduce} />
                </div>
              )
            })}
          </div>
          <p className="px-6 py-5 text-center text-[12px] text-go-muted">{zoneOf(myPos) === 'demote' && league.tier > 0 ? 'Ojo: si la semana cerrara hoy, bajarías de liga.' : 'La liga cierra el domingo a las 23:59. Ganá XP con cada lección.'}</p>
        </div>
      )}
    </div>
  )
}
