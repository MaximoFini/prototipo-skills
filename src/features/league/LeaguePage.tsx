import { memo, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowDown, ArrowUp, Clock } from 'lucide-react'
import { AnimatedNumber, Avatar, Skilly } from '@/design'
import { sfx } from '@/lib/sfx'
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

/** [claro, oscuro] de cada medalla del podio. */
const MEDALS: Record<number, [string, string]> = { 1: ['#FFE38A', '#D9A520'], 2: ['#EEF1F4', '#A9B3BC'], 3: ['#F2BE8A', '#B9733A'] }

const Row = memo(function Row({ entry, pos, animate }: { entry: LeagueEntry; pos: number; animate: boolean }) {
  const medal = MEDALS[pos]
  return (
    <motion.div
      role="listitem"
      layout={animate ? 'position' : false}
      transition={{ type: 'spring', damping: 26, stiffness: 320 }}
      className={`relative flex items-center gap-3 px-4 py-2.5 ${entry.isUser ? 'z-[1] border-y-2 border-go-primary bg-go-primary-tint shadow-[0_4px_12px_rgba(0,82,46,0.15)]' : 'border-b border-go-border bg-white'}`}
      aria-label={`Puesto ${pos}, ${entry.name}, ${entry.xp} XP${entry.isUser ? ', vos' : ''}`}
    >
      {pos <= PROMOTE_COUNT && !entry.isUser && <span aria-hidden className="absolute inset-y-0 left-0 w-1 bg-go-primary/25" />}
      <span
        className={`relative grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full font-display text-[15px] font-extrabold ${medal ? 'text-go-text' : 'text-go-muted'}`}
        style={medal ? { background: `radial-gradient(circle at 35% 30%, ${medal[0]}, ${medal[1]})`, boxShadow: `0 2px 0 ${medal[1]}` } : undefined}
      >
        {medal && animate && <span aria-hidden className="absolute inset-y-0 left-0 w-1/2 animate-[barShine_3s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" style={{ animationDelay: `${pos * 0.4}s` }} />}
        <span className="relative">{pos}</span>
      </span>
      <Avatar id={entry.avatar} name={entry.name} size={40} />
      <span className={`min-w-0 flex-1 truncate font-display text-[17px] font-extrabold ${entry.isUser ? 'text-go-primary' : 'text-go-text'}`}>
        {entry.isUser ? `${entry.name} (vos)` : entry.name}
      </span>
      <span className="font-display text-[16px] font-extrabold tabular-nums text-go-text">{entry.isUser ? <AnimatedNumber value={entry.xp} /> : entry.xp} <span className="text-[12px] font-bold text-go-muted">XP</span></span>
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

  const tier = LEAGUE_TIERS[league.tier]
  const nextName = LEAGUE_TIERS[Math.min(MAX_TIER, league.tier + 1)].name
  const standings = league.standings.map((e) => (e.isUser ? { ...e, xp: league.weekXp } : e))
  const sorted = rank(standings)
  const myPos = sorted.findIndex((e) => e.isUser) + 1
  const cutXp = sorted[PROMOTE_COUNT - 1]?.xp ?? 0
  const missing = Math.max(0, cutXp - league.weekXp + 1)

  // Si el alumno sube de puesto mientras mira la tabla: festejo corto.
  const prevPos = useRef(myPos)
  const [climb, setClimb] = useState<number | null>(null)
  useEffect(() => {
    if (myPos > 0 && prevPos.current > 0 && myPos < prevPos.current) {
      setClimb(myPos)
      sfx.streak()
      const t = window.setTimeout(() => setClimb(null), 2200)
      prevPos.current = myPos
      return () => window.clearTimeout(t)
    }
    prevPos.current = myPos
  }, [myPos])

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


  return (
    <div className="relative flex h-full flex-col bg-white">
      <AnimatePresence>
        {climb && (
          <motion.div role="status" initial={{ y: -40, opacity: 0, scale: 0.9 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: -40, opacity: 0 }}
            transition={{ type: 'spring', damping: 16, stiffness: 300 }}
            className="absolute inset-x-6 top-3 z-30 flex items-center justify-center gap-2 rounded-full bg-go-primary px-4 py-2.5 font-display text-[16px] font-extrabold text-white shadow-lg" style={{ marginTop: 'var(--safe-top)' }}>
            <ArrowUp size={18} strokeWidth={3} aria-hidden /> ¡Subiste al puesto #{climb}!
          </motion.div>
        )}
      </AnimatePresence>
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
        <div className="scroll-y flex-1" tabIndex={0}>
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
                  {pos === PROMOTE_COUNT && league.tier < MAX_TIER && (
                    <div className="flex items-center gap-2 px-4 py-1.5" aria-hidden>
                      <span className="h-0 flex-1 border-t-2 border-dashed border-go-primary/40" />
                      <span className="font-display text-[11px] font-extrabold uppercase tracking-[0.1em] text-go-primary">Línea de ascenso</span>
                      <span className="h-0 flex-1 border-t-2 border-dashed border-go-primary/40" />
                    </div>
                  )}
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
