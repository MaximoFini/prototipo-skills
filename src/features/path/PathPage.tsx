import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Dumbbell } from 'lucide-react'
import {
  Button, CheckIcon, ChestIcon, DemoTrigger, GemChip, GemIcon, HeartChip, LockIcon, Modal, Ribbon, ShieldMark,
  ShieldNode, Skilly, StarIcon, StreakChip, BoltIcon,
} from '@/design'
import { VacationBanner } from '@/features/vacation/VacationBanner'
import { OutOfHeartsModal } from '@/features/lesson/OutOfHeartsModal'
import { useApp, selectXpToday } from '@/store/useApp'
import { allLessons, currentLessonId, levels } from '@/data/content'
import type { Lesson, LevelId, Unit } from '@/domain/types'
import { sfx } from '@/lib/sfx'
import { burst } from '@/lib/confetti'

// ---------- Cofres (persistidos en localStorage) ----------
const CHEST_KEY = 'skills-go-chests'
function loadChests(): string[] {
  try {
    const raw = localStorage.getItem(CHEST_KEY)
    const v = raw ? JSON.parse(raw) : []
    return Array.isArray(v) ? v : []
  } catch { return [] }
}
function saveChests(ids: string[]) {
  try { localStorage.setItem(CHEST_KEY, JSON.stringify(ids)) } catch { /* sin storage */ }
}

// ---------- Modelo del mapa ----------
const OFFSETS = [0, 46, 72, 46, 0, -46, -72, -46]
type MapItem =
  | { kind: 'ribbon'; key: string; unit: Unit; levelStart?: string }
  | { kind: 'lesson'; key: string; lesson: Lesson; unit: Unit; indexInUnit: number; offset: number }
  | { kind: 'chest'; key: string; afterLessonId: string; offset: number }
  | { kind: 'soon'; key: string; offset: number }

function buildMap(): MapItem[] {
  const items: MapItem[] = []
  let n = 0
  const seen = new Set<LevelId>()
  for (const level of levels) {
    for (const unit of level.units) {
      const levelStart = seen.has(level.id) ? undefined : level.name
      seen.add(level.id)
      items.push({ kind: 'ribbon', key: `r-${unit.id}`, unit, levelStart })
      if (unit.comingSoon || unit.lessons.length === 0) {
        for (let i = 0; i < 3; i++) items.push({ kind: 'soon', key: `s-${unit.id}-${i}`, offset: OFFSETS[n++ % OFFSETS.length] })
        continue
      }
      unit.lessons.forEach((lesson, i) => {
        items.push({ kind: 'lesson', key: lesson.id, lesson, unit, indexInUnit: i, offset: OFFSETS[n++ % OFFSETS.length] })
        if ((i + 1) % 2 === 0) items.push({ kind: 'chest', key: `chest-${lesson.id}`, afterLessonId: lesson.id, offset: OFFSETS[n++ % OFFSETS.length] })
      })
    }
  }
  return items
}

const CHEERS = ['¡Vamos!', '¡Dale que podés!', '¡A practicar!', '¡Una más!', '¡Tu turno!']

type Sheet =
  | { kind: 'lesson'; lesson: Lesson; unit: Unit; index: number; done: boolean }
  | { kind: 'locked' }
  | { kind: 'soon' }
  | null

export default function PathPage() {
  const nav = useNavigate()
  const completed = useApp((s) => s.completed)
  const hearts = useApp((s) => s.hearts)
  const xpToday = useApp(selectXpToday)
  const goal = useApp((s) => s.settings.dailyGoal)
  const [claimed, setClaimed] = useState<string[]>(loadChests)
  const [sheet, setSheet] = useState<Sheet>(null)
  const [noHearts, setNoHearts] = useState(false)
  const [reward, setReward] = useState<number | null>(null)
  const [hint, setHint] = useState<string | null>(null)
  const [tip, setTip] = useState(false)
  const activeRef = useRef<HTMLDivElement>(null)

  const items = useMemo(buildMap, [])
  const activeId = currentLessonId(completed)
  const cheer = useMemo(() => CHEERS[Math.floor(Math.random() * CHEERS.length)], [activeId])

  useEffect(() => {
    const t = setTimeout(() => {
      const smooth = !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
      activeRef.current?.scrollIntoView({ block: 'center', behavior: smooth ? 'smooth' : 'auto' })
    }, 250)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!hint) return
    const t = setTimeout(() => setHint(null), 2200)
    return () => clearTimeout(t)
  }, [hint])

  const tapLesson = (lesson: Lesson, unit: Unit, index: number) => {
    sfx.tap()
    const done = !!completed[lesson.id]
    if (!done && lesson.id !== activeId) return setSheet({ kind: 'locked' })
    setSheet({ kind: 'lesson', lesson, unit, index, done })
  }
  const tapChest = (id: string, available: boolean) => {
    if (claimed.includes(id)) return
    if (!available) { setHint('Completá la lección anterior para abrir este cofre.'); return }
    const gems = 10 + Math.floor(Math.random() * 11)
    useApp.getState().addGems(gems)
    sfx.gem()
    burst()
    const next = [...claimed, id]
    setClaimed(next)
    saveChests(next)
    setReward(gems)
  }

  const goalPct = Math.min(1, goal > 0 ? xpToday / goal : 0)
  const R = 15
  const C = 2 * Math.PI * R

  const lessonSheet = sheet?.kind === 'lesson' ? sheet : null
  const startLesson = () => {
    if (!lessonSheet) return
    if (hearts === 0) { setNoHearts(true); setSheet(null); return }
    const id = lessonSheet.lesson.id
    setSheet(null)
    nav(`/lesson/${id}`)
  }

  return (
    <div className="flex h-full flex-col">
      <header className="relative z-20 flex shrink-0 items-center gap-1 border-b-2 border-go-border bg-white px-2 pb-1" style={{ paddingTop: 'calc(8px + var(--safe-top))' }}>
        <DemoTrigger className="mr-1 shrink-0 px-1"><ShieldMark size={28} /></DemoTrigger>
        <StreakChip onClick={() => nav('/profile/stats')} />
        <GemChip onClick={() => nav('/shop')} />
        <HeartChip onClick={() => nav('/shop')} />
        <div className="relative ml-auto">
          <button type="button" onClick={() => setTip((v) => !v)} onBlur={() => setTip(false)} title={`Meta diaria: ${xpToday} de ${goal} XP`}
            aria-label={`Meta diaria: ${xpToday} de ${goal} XP`} aria-expanded={tip} className="grid h-11 w-11 place-items-center">
            <svg width="38" height="38" viewBox="0 0 38 38" aria-hidden>
              <circle cx="19" cy="19" r={R} fill="none" stroke="#E4DDD9" strokeWidth="5" />
              <circle cx="19" cy="19" r={R} fill="none" stroke={goalPct >= 1 ? '#F2C94C' : '#00522E'} strokeWidth="5" strokeLinecap="round"
                strokeDasharray={C} strokeDashoffset={C * (1 - goalPct)} transform="rotate(-90 19 19)" style={{ transition: 'stroke-dashoffset .6s ease-out' }} />
            </svg>
            <span className="absolute"><BoltIcon size={16} /></span>
          </button>
          {tip && (
            <div role="tooltip" className="absolute right-0 top-12 z-30 whitespace-nowrap rounded-xl bg-go-text px-3 py-2 text-[13px] font-bold text-white">
              Meta diaria: {xpToday} / {goal} XP
            </div>
          )}
        </div>
      </header>

      <div className="relative min-h-0 flex-1">
        <div className="scroll-y h-full pb-28">
          <VacationBanner />
          <div className="pt-2">
            {items.map((it, i) => {
              if (it.kind === 'ribbon') {
                const unitIdx = levels.flatMap((l) => l.units).findIndex((u) => u.id === it.unit.id)
                return (
                  <Fragment key={it.key}>
                    {it.levelStart && (
                      <div className="mx-4 mt-4 flex items-center gap-3" role="separator" aria-label={it.levelStart}>
                        <span className="h-[3px] flex-1 rounded-full bg-go-border" />
                        <span className="rounded-full bg-go-danger px-3 py-1 font-display text-[12px] font-extrabold uppercase tracking-[0.1em] text-white">{it.levelStart}</span>
                        <span className="h-[3px] flex-1 rounded-full bg-go-border" />
                      </div>
                    )}
                    <div className="mb-6 mt-3">
                      <Ribbon tone={it.unit.comingSoon ? 'locked' : 'green'} sub={it.unit.description}>UNIDAD {unitIdx + 1} · {it.unit.title}</Ribbon>
                    </div>
                  </Fragment>
                )
              }
              const prev = items[i - 1]
              const showConnector = prev && prev.kind !== 'ribbon'
              const prevOffset = prev && prev.kind !== 'ribbon' ? prev.offset : 0
              return (
                <Fragment key={it.key}>
                  {showConnector && <Connector from={prevOffset} to={it.offset} />}
                  {it.kind === 'soon' && (
                    <NodeRow offset={it.offset}>
                      <ShieldNode state="locked" size={68} label="Próximamente" onClick={() => setSheet({ kind: 'soon' })}><LockIcon size={26} /></ShieldNode>
                    </NodeRow>
                  )}
                  {it.kind === 'chest' && (
                    <NodeRow offset={it.offset}>
                      <Chest state={claimed.includes(it.key) ? 'open' : completed[it.afterLessonId] ? 'ready' : 'locked'} onClick={() => tapChest(it.key, !!completed[it.afterLessonId])} />
                    </NodeRow>
                  )}
                  {it.kind === 'lesson' && (() => {
                    const done = !!completed[it.lesson.id]
                    const active = it.lesson.id === activeId
                    const state = done ? 'done' : active ? 'active' : 'locked'
                    const level = levels.find((l) => l.units.some((u) => u.id === it.unit.id))
                    return (
                      <NodeRow offset={it.offset} innerRef={active ? activeRef : undefined}>
                        {active && (
                          <div className="pointer-events-none absolute bottom-0 z-10 flex flex-col items-center" style={{ [it.offset >= 0 ? 'right' : 'left']: 'calc(100% + 6px)' }}>
                            <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.5, type: 'spring' }}
                              className="relative mb-1 whitespace-nowrap rounded-xl border-2 border-go-border bg-white px-2.5 py-1 font-display text-[13px] font-extrabold text-go-primary">
                              {cheer}
                              <span aria-hidden className="absolute -bottom-[7px] left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-go-border bg-white" />
                            </motion.div>
                            <div className="relative">
                              <Skilly mood="happy" size={84} />
                              <span className="absolute -top-1 -right-3 rounded-md bg-go-danger px-1.5 py-0.5 font-display text-[10px] font-extrabold text-white">{level?.id}</span>
                            </div>
                          </div>
                        )}
                        <ShieldNode state={state} size={76} label={`${it.lesson.title}${done ? ', completada' : active ? ', actual' : ', bloqueada'}`} onClick={() => tapLesson(it.lesson, it.unit, it.indexInUnit)}>
                          {done ? <CheckIcon size={32} /> : active ? <StarIcon size={32} /> : <LockIcon size={28} />}
                        </ShieldNode>
                      </NodeRow>
                    )
                  })()}
                </Fragment>
              )
            })}
            {allLessons.length > 0 && !activeId && (
              <p className="mx-6 mt-6 text-center font-display text-[16px] font-extrabold text-go-primary">¡Completaste todo lo disponible! Pronto, más unidades.</p>
            )}
            {allLessons.length === 0 && <p className="mx-6 mt-8 text-center text-go-muted">Las lecciones se están preparando.</p>}
          </div>
        </div>

        {hint && (
          <div role="status" className="absolute inset-x-6 bottom-20 z-20 rounded-xl bg-go-text px-4 py-3 text-center text-[14px] font-bold text-white">{hint}</div>
        )}
        <button type="button" onClick={() => nav('/practice')} aria-label="Práctica"
          className="btn-3d absolute bottom-4 right-4 z-20 gap-1.5 border-go-border-dark bg-white px-4 py-2.5 text-go-primary shadow-md">
          <Dumbbell size={20} strokeWidth={3} />Práctica
        </button>
      </div>

      <Modal open={!!sheet} onClose={() => setSheet(null)}>
        {lessonSheet && (
          <div className="text-center">
            <p className="font-display text-[12px] font-extrabold uppercase tracking-[0.1em] text-go-muted">{lessonSheet.unit.title}</p>
            <h2 className="mt-1 font-display text-[24px] font-extrabold text-go-text">{lessonSheet.lesson.title}</h2>
            <p className="mt-1 text-go-muted">Lección {lessonSheet.index + 1} de {lessonSheet.unit.lessons.length} de la unidad</p>
            <div className="mt-5">
              {lessonSheet.done ? (
                <Button block variant="secondary" onClick={startLesson}>Practicar de nuevo +5 XP</Button>
              ) : (
                <Button block onClick={startLesson}>Empezar +10 XP</Button>
              )}
            </div>
          </div>
        )}
        {sheet?.kind === 'locked' && (
          <div className="flex flex-col items-center gap-3 text-center">
            <Skilly mood="think" size={72} />
            <h2 className="font-display text-[22px] font-extrabold text-go-text">Todavía no</h2>
            <p className="text-go-muted">Completá las lecciones anteriores para desbloquear esta.</p>
            <Button block variant="secondary" onClick={() => setSheet(null)}>Entendido</Button>
          </div>
        )}
        {sheet?.kind === 'soon' && (
          <div className="flex flex-col items-center gap-3 text-center">
            <Skilly mood="wink" size={72} />
            <h2 className="font-display text-[22px] font-extrabold text-go-text">Próximamente</h2>
            <p className="text-go-muted">Esta unidad está en camino. ¡Mientras tanto, seguí sumando!</p>
            <Button block variant="secondary" onClick={() => setSheet(null)}>Entendido</Button>
          </div>
        )}
      </Modal>

      <Modal open={reward !== null} onClose={() => setReward(null)} sheet={false}>
        <div className="flex flex-col items-center gap-2 text-center">
          <ChestIcon size={72} open />
          <h2 className="font-display text-[24px] font-extrabold text-go-text">¡Cofre abierto!</h2>
          <p className="flex items-center gap-1 font-display text-[28px] font-extrabold text-go-gem"><GemIcon size={32} />+{reward}</p>
          <Button block onClick={() => setReward(null)} className="mt-2">Genial</Button>
        </div>
      </Modal>

      <OutOfHeartsModal open={noHearts} onClose={() => setNoHearts(false)} onPractice={() => { setNoHearts(false); nav('/practice/session?heal=1') }} />
    </div>
  )
}

function NodeRow({ offset, children, innerRef }: { offset: number; children: React.ReactNode; innerRef?: React.Ref<HTMLDivElement> }) {
  return (
    <div className="flex h-[96px] items-center justify-center">
      <div ref={innerRef} className="relative" style={{ transform: `translateX(${offset}px)` }}>{children}</div>
    </div>
  )
}

function Connector({ from, to }: { from: number; to: number }) {
  const dots = [0.2, 0.4, 0.6, 0.8].map((t) => ({ x: from + (to - from) * t, y: 4 + 12 * t }))
  return (
    <svg className="mx-auto block" width="320" height="20" viewBox="-160 0 320 20" aria-hidden>
      {dots.map((d, i) => <circle key={i} cx={d.x} cy={d.y} r="3.5" fill="#D8CFCC" />)}
    </svg>
  )
}

function Chest({ state, onClick }: { state: 'locked' | 'ready' | 'open'; onClick: () => void }) {
  const label = state === 'open' ? 'Cofre abierto' : state === 'ready' ? 'Abrir cofre' : 'Cofre bloqueado'
  return (
    <button type="button" onClick={onClick} aria-label={label} className={`grid h-16 w-16 place-items-center rounded-full ${state === 'ready' ? 'animate-float bg-go-xp/30' : ''}`}>
      <span className={state === 'locked' ? 'opacity-40 grayscale' : ''}><ChestIcon size={50} open={state === 'open'} /></span>
      {state === 'locked' && <span className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-go-locked text-go-muted"><LockIcon size={14} /></span>}
    </button>
  )
}
