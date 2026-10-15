import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { Button, InstallCard, Modal, ScreenHeader } from '@/design'
import { useApp } from '@/store/useApp'
import { GOAL_LABELS } from '@/domain/rules'
import type { DailyGoal } from '@/domain/types'

const GOALS: DailyGoal[] = [10, 20, 30, 50]

export default function SettingsPage() {
  const nav = useNavigate()
  const settings = useApp((s) => s.settings)
  const setSettings = useApp((s) => s.setSettings)
  const [confirm, setConfirm] = useState(false)

  const reset = () => {
    useApp.getState().reset()
    try { localStorage.removeItem('skills-go-chests') } catch { /* sin storage */ }
    setConfirm(false)
    nav('/welcome', { replace: true })
  }
  const logout = () => {
    useApp.getState().setProfile({ onboarded: false })
    nav('/welcome', { replace: true })
  }

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="Configuración" back="/profile" />
      <div className="scroll-y flex-1 space-y-5 px-4 py-4">
        <InstallCard />

        <section aria-label="Meta diaria">
          <h2 className="mb-2 font-display text-[18px] font-extrabold text-go-text">Meta diaria</h2>
          <div className="space-y-2" role="radiogroup" aria-label="Meta diaria">
            {GOALS.map((g) => {
              const sel = settings.dailyGoal === g
              return (
                <button key={g} type="button" role="radio" aria-checked={sel} onClick={() => setSettings({ dailyGoal: g })}
                  className={`flex min-h-[52px] w-full items-center justify-between rounded-go border-2 px-4 py-2 text-left ${sel ? 'border-go-primary bg-go-primary-tint' : 'border-go-border'}`}>
                  <span className="font-display text-[16px] font-extrabold text-go-text">{GOAL_LABELS[g].name}</span>
                  <span className="text-[14px] text-go-muted">{GOAL_LABELS[g].minutes} min · {g} XP</span>
                </button>
              )
            })}
          </div>
        </section>

        <section aria-label="Preferencias" className="card-go divide-y-2 divide-go-border overflow-hidden">
          <Toggle label="Sonido" sub="Efectos al acertar y completar" checked={settings.sound} onChange={(v) => setSettings({ sound: v })} />
          <Toggle label="Notificaciones" sub="Recordatorios de práctica y racha" checked={settings.notifications} onChange={(v) => setSettings({ notifications: v })} />
          <button type="button" onClick={() => nav('/settings/reminders')} className="flex min-h-[56px] w-full items-center gap-3 px-4 py-3 text-left active:bg-go-surface">
            <span className="flex-1">
              <span className="block font-display text-[16px] font-bold text-go-text">Recordatorios</span>
              <span className="block text-[13px] text-go-muted">{settings.reminderTime} h</span>
            </span>
            <ChevronRight size={20} className="text-go-muted" />
          </button>
        </section>

        <section aria-label="Cuenta" className="space-y-2">
          <Button block variant="secondary" onClick={logout}>Cerrar sesión</Button>
          <Button block variant="danger" onClick={() => setConfirm(true)}>Reiniciar progreso</Button>
        </section>

        <footer className="pb-4 text-center text-[13px] text-go-muted">
          <p>Skills Go · versión 1.0.0 (prototipo)</p>
          <p className="mt-1">Hecho con <span aria-label="amor" className="text-go-heart">❤</span> para Skills English Institute</p>
        </footer>
      </div>

      <Modal open={confirm} onClose={() => setConfirm(false)}>
        <h2 className="font-display text-[22px] font-extrabold text-go-text">¿Reiniciar todo?</h2>
        <p className="mt-2 text-go-muted">Vas a perder tu racha, XP, gemas y lecciones completadas. Esto no se puede deshacer.</p>
        <div className="mt-5 space-y-2">
          <Button block variant="secondary" onClick={() => setConfirm(false)}>Cancelar</Button>
          <Button block variant="danger" onClick={reset}>Sí, reiniciar</Button>
        </div>
      </Modal>
    </div>
  )
}

function Toggle({ label, sub, checked, onChange }: { label: string; sub: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex min-h-[56px] items-center gap-3 px-4 py-3">
      <span className="flex-1">
        <span className="block font-display text-[16px] font-bold text-go-text">{label}</span>
        <span className="block text-[13px] text-go-muted">{sub}</span>
      </span>
      <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)}
        className={`relative h-8 w-14 shrink-0 rounded-full transition-colors ${checked ? 'bg-go-primary' : 'bg-go-locked'}`}>
        <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${checked ? 'left-7' : 'left-1'}`} />
      </button>
    </div>
  )
}
