import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Pause, Play, X } from 'lucide-react'
import { Skilly } from '@/design'
import { useApp } from '@/store/useApp'
import { currentLessonId } from '@/data/content'
import { loadSofiDemo } from './sofiProfile'

/**
 * Modo presentación: recorre solo las pantallas clave con un subtítulo,
 * para mostrar la app en una pantalla grande sin tocar nada.
 * Se abre desde el panel de demo, con Ctrl+Shift+P o con ?tour=1 en la URL.
 */
export const TOUR_EVENT = 'skills:tour'
const STEP_MS = 5500

interface Step { path: () => string; title: string; text: string }
const STEPS: Step[] = [
  { path: () => '/', title: 'Un camino claro', text: 'Cada alumno avanza lección por lección por su nivel, con cofres y desafíos en el medio.' },
  { path: () => `/lesson/${currentLessonId(useApp.getState().completed) ?? 'a1-u1-l1'}`, title: 'Lecciones de 3 minutos', text: 'Unir pares, escuchar, escribir y hablar. Feedback al instante, con Skilly al lado.' },
  { path: () => '/league', title: 'Ligas semanales', text: 'Compiten con sus compañeros por subir de liga. Es la razón para volver cada día.' },
  { path: () => '/quests', title: 'Misiones diarias', text: 'Metas cortas que se renuevan cada día y dan gemas al completarlas.' },
  { path: () => '/vacation', title: 'Desafío de Vacaciones', text: '21 días seguidos = premios reales en la academia. El inglés no se toma vacaciones.' },
  { path: () => '/profile/achievements', title: 'Logros y medallas', text: 'Bronce, plata y oro: cada avance se celebra y queda en su perfil.' },
  { path: () => '/profile/stats', title: 'Progreso visible', text: 'Racha, XP por día y precisión: el alumno (y su familia) ven cuánto avanzó.' },
  { path: adminAsDirector, title: 'Panel para la academia', text: 'Los profes ven quién practica, quién está en riesgo y cómo va cada comisión.' },
]

/** Entra al panel como Dirección (misma sesión que guarda AdminContext) para no caer en el login. */
function adminAsDirector(): string {
  try { sessionStorage.setItem('skills-go-admin-session', JSON.stringify({ role: 'direccion' })) } catch { /* sin storage */ }
  return '/admin'
}

export function PresentationTour() {
  const nav = useNavigate()
  const [on, setOn] = useState(false)
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)

  const start = useCallback(() => {
    if (!useApp.getState().profile.onboarded) loadSofiDemo()
    setI(0); setPaused(false); setOn(true)
  }, [])
  const stop = useCallback(() => { setOn(false); nav('/') }, [nav])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'p') { e.preventDefault(); start() }
    }
    window.addEventListener(TOUR_EVENT, start)
    window.addEventListener('keydown', onKey)
    if (new URLSearchParams(window.location.search).get('tour') === '1') start()
    return () => { window.removeEventListener(TOUR_EVENT, start); window.removeEventListener('keydown', onKey) }
  }, [start])

  // Navega al paso actual.
  useEffect(() => { if (on) nav(STEPS[i].path()) }, [on, i, nav])

  // Avance automático.
  useEffect(() => {
    if (!on || paused) return
    const t = window.setTimeout(() => setI((n) => (n + 1) % STEPS.length), STEP_MS)
    return () => window.clearTimeout(t)
  }, [on, paused, i])

  // Teclado mientras corre: flechas, espacio, Esc.
  useEffect(() => {
    if (!on) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') stop()
      else if (e.key === 'ArrowRight') setI((n) => (n + 1) % STEPS.length)
      else if (e.key === 'ArrowLeft') setI((n) => (n - 1 + STEPS.length) % STEPS.length)
      else if (e.key === ' ') { e.preventDefault(); setPaused((p) => !p) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [on, stop])

  const step = STEPS[i]
  const ctl = 'grid h-9 w-9 place-items-center rounded-full text-white/80 hover:bg-white/15 hover:text-white'

  return (
    <AnimatePresence>
      {on && (
        <motion.div role="region" aria-label="Modo presentación" aria-live="polite"
          // Solo opacidad: el transform lo usa el centrado vertical en pantallas anchas.
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          // En pantallas anchas va al costado del teléfono para no tapar la app.
          className="fixed inset-x-3 bottom-3 z-[100] mx-auto max-w-[620px] overflow-hidden rounded-[20px] bg-go-primary-dark/95 text-white shadow-2xl backdrop-blur sm:bottom-6 lg:inset-x-auto lg:bottom-auto lg:left-[calc(50%+250px)] lg:top-1/2 lg:w-[380px] lg:-translate-y-1/2">
          <div className="flex flex-wrap items-center gap-3 px-4 py-3 lg:items-start">
            <Skilly mood={i % 2 ? 'wink' : 'cheer'} size={52} />
            <AnimatePresence mode="wait">
              <motion.div key={i} className="min-w-0 flex-1" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
                <p className="font-display text-[18px] font-extrabold leading-tight">{step.title}</p>
                <p className="text-[14px] leading-snug text-white/85">{step.text}</p>
              </motion.div>
            </AnimatePresence>
            <div className="flex shrink-0 items-center lg:w-full lg:justify-end">
              <button type="button" className={ctl} aria-label="Anterior" onClick={() => setI((n) => (n - 1 + STEPS.length) % STEPS.length)}><ChevronLeft size={20} /></button>
              <button type="button" className={ctl} aria-label={paused ? 'Reanudar' : 'Pausar'} onClick={() => setPaused((p) => !p)}>{paused ? <Play size={18} /> : <Pause size={18} />}</button>
              <button type="button" className={ctl} aria-label="Siguiente" onClick={() => setI((n) => (n + 1) % STEPS.length)}><ChevronRight size={20} /></button>
              <button type="button" className={ctl} aria-label="Salir de la presentación" onClick={stop}><X size={20} /></button>
            </div>
          </div>
          {/* Progreso: un segmento por paso; el actual se llena con el tiempo. */}
          <div className="flex gap-1 px-4 pb-3">
            {STEPS.map((s, k) => (
              <div key={s.title} className="h-1 flex-1 overflow-hidden rounded-full bg-white/20">
                {k < i && <div className="h-full w-full bg-go-xp" />}
                {k === i && (
                  <motion.div key={`${i}-${paused}`} className="h-full bg-go-xp" initial={{ width: paused ? '100%' : '0%' }}
                    animate={{ width: '100%' }} transition={{ duration: paused ? 0 : STEP_MS / 1000, ease: 'linear' }} />
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
