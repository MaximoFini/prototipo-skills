import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Bell, ChevronLeft } from 'lucide-react'
import { Avatar, AVATAR_IDS, Button, Lockup, ProgressBar, ShieldMark, Skilly, type SkillyMood } from '@/design'
import { useApp } from '@/store/useApp'
import { GOAL_LABELS } from '@/domain/rules'
import type { DailyGoal, LevelId } from '@/domain/types'
import { sfx } from '@/lib/sfx'

type Step = 'splash' | 'name' | 'level' | 'goal' | 'notif'
const ORDER: Step[] = ['splash', 'name', 'level', 'goal', 'notif']
const GOALS: DailyGoal[] = [10, 20, 30, 50]

function Bubble({ children, mood = 'happy', size = 96 }: { children: ReactNode; mood?: SkillyMood; size?: number }) {
  return (
    <div className="flex items-end gap-2">
      <Skilly mood={mood} size={size} />
      <div className="relative mb-6 flex-1 rounded-go border-2 border-go-border bg-white px-4 py-3 font-display text-[18px] font-bold leading-snug text-go-text">
        {children}
        <span aria-hidden className="absolute -left-[9px] bottom-5 h-4 w-4 rotate-45 border-b-2 border-l-2 border-go-border bg-white" />
      </div>
    </div>
  )
}

export default function OnboardingPage() {
  const nav = useNavigate()
  const [step, setStep] = useState<Step>('splash')
  const [dir, setDir] = useState(1)
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState('a1')
  const [level, setLevel] = useState<LevelId | 'test' | null>(null)
  const [goal, setGoal] = useState<DailyGoal>(20)

  const idx = ORDER.indexOf(step)
  const go = (to: Step) => { setDir(ORDER.indexOf(to) > idx ? 1 : -1); setStep(to) }
  const next = () => { sfx.tap(); go(ORDER[Math.min(ORDER.length - 1, idx + 1)]) }
  const back = () => go(ORDER[Math.max(0, idx - 1)])

  const finish = (notifications: boolean) => {
    const app = useApp.getState()
    app.completeOnboarding({ name: name.trim() || 'Alumno', avatar, level: level === 'test' || level === null ? 'A1' : level, dailyGoal: goal })
    app.setSettings({ notifications })
    sfx.finish()
    nav(level === 'test' ? '/placement' : '/', { replace: true })
  }
  const demo = () => {
    useApp.getState().completeOnboarding({ name: 'Sofi', avatar: 'a3', level: 'A1', dailyGoal: 20 })
    nav('/', { replace: true })
  }

  const variants = {
    enter: (d: number) => ({ x: 40 * d, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: -40 * d, opacity: 0 }),
  }

  return (
    <div className={`flex h-full flex-col ${step === 'splash' ? 'bg-go-primary' : 'bg-white'}`}>
      {step !== 'splash' && (
        <div className="flex shrink-0 items-center gap-2 px-3 pb-2" style={{ paddingTop: 'calc(12px + var(--safe-top))' }}>
          <button type="button" onClick={back} aria-label="Volver" className="grid h-10 w-10 place-items-center rounded-full text-go-muted active:bg-go-surface">
            <ChevronLeft size={28} strokeWidth={3} />
          </button>
          <ProgressBar value={(idx / (ORDER.length - 1)) * 100} height={14} />
        </div>
      )}
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <AnimatePresence mode="wait" custom={dir} initial={false}>
          <motion.div key={step} custom={dir} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2, ease: 'easeOut' }} className="absolute inset-0 flex flex-col">
            {step === 'splash' && (
              <div className="flex h-full flex-col items-center justify-between px-6 text-center text-white" style={{ paddingTop: 'calc(48px + var(--safe-top))', paddingBottom: 'calc(24px + var(--safe-bottom))' }}>
                <div className="flex flex-col items-center gap-6">
                  <div className="rounded-3xl bg-white/10 p-5"><ShieldMark size={96} /></div>
                  <div className="rounded-go bg-white px-5 py-3"><Lockup height={52} /></div>
                  <p className="font-display text-[22px] font-bold italic">Building Skills</p>
                  <p className="max-w-[260px] text-[15px] opacity-90">Tu inglés no se toma vacaciones. Practicá un ratito todos los días.</p>
                </div>
                <div className="w-full space-y-3">
                  <Skilly mood="cheer" size={84} className="mx-auto" />
                  <button type="button" onClick={next} className="btn-3d w-full border-[#C9A02C] bg-go-xp text-go-text">Empezar</button>
                  <button type="button" onClick={demo} className="min-h-[44px] w-full text-[13px] font-medium text-white/80 underline-offset-2 hover:underline">Entrar con perfil demo</button>
                </div>
              </div>
            )}

            {step === 'name' && (
              <Screen footer={<Button block disabled={!name.trim()} onClick={next}>Continuar</Button>}>
                <Bubble>¡Hola! Soy Skilly. ¿Cómo te llamás?</Bubble>
                <label className="mt-6 block">
                  <span className="sr-only">Tu nombre</span>
                  <input value={name} onChange={(e) => setName(e.target.value.slice(0, 20))} placeholder="Tu nombre" autoComplete="given-name" maxLength={20}
                    className="w-full rounded-go border-2 border-go-border bg-go-surface px-4 py-3 font-display text-[20px] font-bold text-go-text outline-none placeholder:text-go-muted focus:border-go-primary" />
                </label>
                <p className="mb-2 mt-6 font-display text-[15px] font-extrabold text-go-text">Elegí tu avatar</p>
                <div className="grid grid-cols-4 gap-3" role="radiogroup" aria-label="Avatar">
                  {AVATAR_IDS.map((id) => (
                    <button key={id} type="button" role="radio" aria-checked={avatar === id} aria-label={`Avatar ${id}`} onClick={() => setAvatar(id)}
                      className={`grid min-h-[64px] place-items-center rounded-go border-2 py-2 ${avatar === id ? 'border-go-primary bg-go-primary-tint' : 'border-transparent'}`}>
                      <Avatar id={id} name={name || 'S'} size={46} />
                    </button>
                  ))}
                </div>
              </Screen>
            )}

            {step === 'level' && (
              <Screen footer={<Button block disabled={!level} onClick={next}>Continuar</Button>}>
                <Bubble mood="think">{name.trim() ? `${name.trim()}, ¿` : '¿'}cuál es tu nivel de inglés?</Bubble>
                <div className="mt-6 space-y-3" role="radiogroup" aria-label="Nivel">
                  <Choice selected={level === 'A1'} onClick={() => setLevel('A1')} title="Empezar desde cero" sub="Arrancamos por lo básico, A1 Starter" />
                  <Choice selected={level === 'test'} onClick={() => setLevel('test')} title="Hacer test de nivel" sub="8 preguntas cortitas para ubicarte" />
                </div>
              </Screen>
            )}

            {step === 'goal' && (
              <Screen footer={<Button block onClick={next}>Continuar</Button>}>
                <Bubble>¿Cuánto querés practicar por día?</Bubble>
                <div className="mt-6 space-y-3" role="radiogroup" aria-label="Meta diaria">
                  {GOALS.map((g) => (
                    <Choice key={g} selected={goal === g} onClick={() => setGoal(g)} title={GOAL_LABELS[g].name} sub={`${GOAL_LABELS[g].minutes} min · ${g} XP`} />
                  ))}
                </div>
              </Screen>
            )}

            {step === 'notif' && (
              <Screen footer={
                <div className="space-y-2">
                  <Button block onClick={() => finish(true)}>Activar recordatorios</Button>
                  <Button block variant="ghost" onClick={() => finish(false)}>Ahora no</Button>
                </div>
              }>
                <Bubble mood="wink">Te aviso cuando tu racha esté en peligro. ¡Prometo no spamear!</Bubble>
                <div className="mt-8 grid place-items-center">
                  <motion.div animate={{ rotate: [0, -14, 14, -10, 10, 0] }} transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 1.5 }} className="grid h-28 w-28 place-items-center rounded-full bg-go-xp/30">
                    <Bell size={56} className="text-go-xp-dark" strokeWidth={2.5} />
                  </motion.div>
                  <p className="mt-4 max-w-[260px] text-center text-[15px] text-go-muted">Un recordatorio por día, a la hora que elijas. Lo podés cambiar en Configuración.</p>
                </div>
              </Screen>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

function Screen({ children, footer }: { children: ReactNode; footer: ReactNode }) {
  return (
    <div className="flex h-full flex-col">
      <div className="scroll-y flex-1 px-5 pt-4">{children}</div>
      <div className="shrink-0 border-t-2 border-go-border px-5 pt-3" style={{ paddingBottom: 'calc(16px + var(--safe-bottom))' }}>{footer}</div>
    </div>
  )
}

function Choice({ selected, onClick, title, sub }: { selected: boolean; onClick: () => void; title: string; sub: string }) {
  return (
    <button type="button" role="radio" aria-checked={selected} onClick={() => { sfx.tap(); onClick() }}
      className={`flex min-h-[64px] w-full items-center justify-between gap-3 rounded-go border-2 border-b-4 px-4 py-3 text-left active:translate-y-[2px] ${selected ? 'border-go-primary bg-go-primary-tint' : 'border-go-border bg-white'}`}>
      <span>
        <span className="block font-display text-[18px] font-extrabold text-go-text">{title}</span>
        <span className="block text-[14px] text-go-muted">{sub}</span>
      </span>
      <span aria-hidden className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 ${selected ? 'border-go-primary bg-go-primary' : 'border-go-border-dark'}`}>
        {selected && <span className="h-2 w-2 rounded-full bg-white" />}
      </span>
    </button>
  )
}
