import { askPermission, showSystemNotification } from '@/lib/systemNotify'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useApp } from '@/store/useApp'
import { now } from '@/domain/clock'
import { HEARTS_MAX, HEART_REGEN_MS } from '@/domain/rules'
import { allLessons, currentLessonId } from '@/data/content'
import type { RunnerResult } from '@/domain/types'
import { closeLeagueWeek } from '@/features/league/register'
import { notifTexts } from './notifTexts'
import { notificationTemplates as tpl } from '@/features/notifications/templates'
import { friendsData } from '@/data/friends'
import { loadSofiDemo } from './sofiProfile'
import { TOUR_EVENT } from './PresentationTour'

const sheetBtn = 'btn-3d bg-white text-go-primary border-2 border-go-border border-b-4 !px-3 !py-2.5 !text-[13px] !normal-case !tracking-normal'
const dangerBtn = 'btn-3d bg-go-danger text-white border-go-danger-dark !px-3 !py-2.5 !text-[13px] !normal-case !tracking-normal'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-4">
      <h3 className="mb-2 font-display text-[13px] font-extrabold uppercase tracking-[0.1em] text-go-muted">{title}</h3>
      <div className="grid grid-cols-2 gap-2">{children}</div>
    </section>
  )
}

function fmtDate(ts: number): string {
  const txt = new Date(ts).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  return txt.charAt(0).toUpperCase() + txt.slice(1)
}

export function DemoPanel() {
  const nav = useNavigate()
  const [open, setOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const timer = useRef<number | undefined>(undefined)
  const offset = useApp((s) => s.clockOffset)
  const hearts = useApp((s) => s.hearts)
  const completed = useApp((s) => s.completed)

  const flash = useCallback((msg: string) => {
    setToast(msg)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setToast(null), 1800)
  }, [])

  useEffect(() => {
    const openIt = () => setOpen(true)
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault()
        setOpen((o) => !o)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('skills:open-demo', openIt)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('skills:open-demo', openIt)
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  const A = () => useApp.getState()
  const go = (path: string) => {
    setOpen(false)
    nav(path)
  }

  const days = (n: number) => {
    A().advanceDays(n)
    flash(`Pasaron ${n} ${n === 1 ? 'día' : 'días'}`)
  }
  const nextLesson = currentLessonId(completed)
  const completeNow = () => {
    const id = currentLessonId(A().completed)
    const lesson = allLessons.find((l) => l.id === id)
    if (!id || !lesson) return flash('No quedan lecciones')
    const n = lesson.exercises.length
    const result: RunnerResult = { correct: n, total: n, mistakes: [], seconds: n * 8, perfect: true, heartsLost: 0, completed: true }
    const sum = A().finishLesson(id, result)
    flash(`Lección completada: +${sum.xpGained} XP${sum.streakExtended ? ' y racha ' + sum.streak : ''}`)
  }
  const name = () => A().profile.name || 'Alumno'
  const notify = (n: { kind: 'streak-risk' | 'league' | 'vacation' | 'friend' | 'generic'; title: string; body: string }, label: string) => {
    A().pushNotification(n)
    flash(`Notificación: ${label}`)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="absolute inset-0 z-[70] flex items-end bg-black/55" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)}>
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Panel de demo"
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[88%] w-full flex-col rounded-t-[24px] bg-white"
            initial={{ y: 120 }}
            animate={{ y: 0 }}
            exit={{ y: 120 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
          >
            <div className="flex shrink-0 items-start gap-2 border-b-2 border-go-border px-4 pb-3 pt-4">
              <div className="flex-1">
                <span className="inline-block bg-go-danger px-2 py-0.5 font-display text-[11px] font-extrabold uppercase tracking-[0.1em] text-white">Demo</span>
                <h2 className="font-display text-[20px] font-extrabold leading-tight text-go-text">Panel de demo</h2>
                <p className="text-[13px] text-go-muted">Solo para la presentación. Nada de esto existe en la app real.</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar panel de demo" className="grid h-10 w-10 place-items-center rounded-full text-go-muted active:bg-go-surface"><X size={24} /></button>
            </div>

            <div className="scroll-y relative flex-1 px-4 pb-6">
              <Section title="Presentación">
                <button type="button" className={`btn-3d col-span-2 border-[#C9A02C] bg-go-xp text-go-text !py-2.5 !text-[13px] !normal-case !tracking-normal`}
                  onClick={() => { setOpen(false); window.dispatchEvent(new Event(TOUR_EVENT)) }}>Modo presentación (recorrido automático)</button>
              </Section>

              <Section title="Tiempo">
                <p className="col-span-2 rounded-xl bg-go-surface px-3 py-2 text-[13px] text-go-text">
                  Fecha simulada: <b>{fmtDate(now())}</b>{offset > 0 && <span className="text-go-muted"> (+{Math.round(offset / 86400000)} d)</span>}
                </p>
                <button type="button" className={sheetBtn} onClick={() => days(1)}>+1 día</button>
                <button type="button" className={sheetBtn} onClick={() => days(3)}>+3 días</button>
                <button type="button" className={`${sheetBtn} col-span-2`} onClick={() => days(7)}>+7 días</button>
              </Section>

              <Section title={`Corazones (${hearts}/${HEARTS_MAX})`}>
                <button type="button" className={dangerBtn} onClick={() => { A().patch({ hearts: 0, heartsAnchor: now() }); flash('Corazones en 0') }}>Dejar en 0</button>
                <button type="button" className={sheetBtn} onClick={() => { A().patch({ hearts: HEARTS_MAX, heartsAnchor: now() }); flash('Corazones llenos') }}>Llenar</button>
                <button type="button" className={`${sheetBtn} col-span-2`} onClick={() => {
                  if (A().hearts >= HEARTS_MAX) return flash('Ya tenés todos los corazones')
                  A().patch((s) => ({ heartsAnchor: s.heartsAnchor - HEART_REGEN_MS }))
                  A().refresh()
                  flash('Regeneración acelerada (5 h)')
                }}>Acelerar regeneración (+5 h)</button>
              </Section>

              <Section title="Recursos">
                <button type="button" className={sheetBtn} onClick={() => { A().addXp(50, 'demo'); flash('+50 XP') }}>+50 XP</button>
                <button type="button" className={sheetBtn} onClick={() => { A().addGems(200); flash('+200 gemas') }}>+200 gemas</button>
              </Section>

              <Section title="Notificaciones">
                <button type="button" className={sheetBtn} onClick={() => notify(tpl.streakRisk(name(), Math.max(1, A().streak.count || 5)), 'racha en peligro')}>Racha en peligro</button>
                <button type="button" className={sheetBtn} onClick={() => notify(notifTexts.leaguePromotion('Plata'), 'liga')}>Liga</button>
                <button type="button" className={sheetBtn} onClick={() => notify(tpl.vacationReminder(), 'vacaciones')}>Vacaciones</button>
                <button type="button" className={sheetBtn} onClick={() => notify(notifTexts.vacationMilestone(7), 'hito del desafío')}>Hito del desafío</button>
                <button type="button" className={sheetBtn} onClick={() => notify(tpl.friendNudge(friendsData[3]?.name ?? 'Lucía'), 'amigo')}>Amigo</button>
                <button type="button" className={sheetBtn} onClick={() => notify(tpl.comeback(name()), 'te extraño')}>Te extraño</button>
              </Section>

              <Section title="Notificación del sistema">
                <button type="button" className={sheetBtn} onClick={async () => { const r = await askPermission(); flash(r === 'granted' ? 'Permiso concedido' : r === 'unsupported' ? 'Tu navegador no lo soporta' : 'Permiso: ' + r) }}>Pedir permiso</button>
                <button type="button" className={sheetBtn} onClick={() => {
                  flash('Llega en 10 s: minimizá la app')
                  window.setTimeout(async () => {
                    const t = tpl.streakRisk(name(), Math.max(1, A().streak.count || 5))
                    if (!(await showSystemNotification(t.title, t.body))) A().pushNotification(t)
                  }, 10_000)
                }}>Enviar en 10 s</button>
              </Section>

              <Section title="Liga">
                <button type="button" className={`${sheetBtn} col-span-2`} onClick={() => { closeLeagueWeek(); setOpen(false); nav('/league'); }}>Cerrar semana de liga</button>
              </Section>

              <Section title="Lección">
                <button type="button" className={sheetBtn} disabled={!nextLesson} onClick={() => nextLesson && go(`/lesson/${nextLesson}`)}>Ir a la próxima</button>
                <button type="button" className={sheetBtn} disabled={!nextLesson} onClick={completeNow}>Completarla ya</button>
              </Section>

              <Section title="Perfiles">
                <button type="button" className={dangerBtn} onClick={() => { A().reset(); setOpen(false); nav('/welcome'); }}>Resetear todo</button>
                <button type="button" className={sheetBtn} onClick={() => {
                  loadSofiDemo()
                  flash('Cargado: Sofi, 12 días de racha')
                  nav('/')
                }}>Alumno con 12 días de racha</button>
              </Section>

              <Section title="Navegación">
                <button type="button" className={sheetBtn} onClick={() => go('/admin')}>Panel /admin</button>
                <button type="button" className={sheetBtn} onClick={() => go('/vacation')}>Desafío</button>
                <button type="button" className={`${sheetBtn} col-span-2`} onClick={() => go('/placement')}>Test de nivel</button>
              </Section>

              <button type="button" className={`${sheetBtn} mt-5 w-full`} onClick={() => setOpen(false)}>Cerrar</button>
            </div>

            <AnimatePresence>
              {toast && (
                <motion.div role="status" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} className="pointer-events-none absolute left-1/2 top-3 z-10 max-w-[90%] -translate-x-1/2 rounded-full bg-go-text px-4 py-2 text-center text-[14px] font-bold text-white shadow-lg">
                  {toast}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
