import { Bell } from 'lucide-react'
import { Button, ScreenHeader, Skilly } from '@/design'
import { useApp } from '@/store/useApp'

const DAYS = [
  { i: 1, l: 'L', n: 'Lunes' }, { i: 2, l: 'M', n: 'Martes' }, { i: 3, l: 'M', n: 'Miércoles' }, { i: 4, l: 'J', n: 'Jueves' },
  { i: 5, l: 'V', n: 'Viernes' }, { i: 6, l: 'S', n: 'Sábado' }, { i: 0, l: 'D', n: 'Domingo' },
]

export default function ReminderSettingsPage() {
  const { reminderTime, reminderDays } = useApp((s) => s.settings)
  const setSettings = useApp((s) => s.setSettings)
  const toggle = (i: number) => setSettings({ reminderDays: reminderDays.includes(i) ? reminderDays.filter((d) => d !== i) : [...reminderDays, i].sort() })
  const test = () => useApp.getState().pushNotification({ kind: 'streak-risk', title: 'Skills Go', body: 'Tu racha está en peligro. ¡Con 5 minutos la salvás!' })

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="Recordatorios" back="/settings" />
      <div className="scroll-y flex-1 space-y-5 px-4 py-4">
        <div className="flex items-end gap-2">
          <Skilly mood="wink" size={80} />
          <p className="mb-4 flex-1 rounded-go border-2 border-go-border px-4 py-3 font-display text-[16px] font-bold text-go-text">Elegí cuándo te aviso. Prometo ser puntual… y un poquito insistente.</p>
        </div>

        <section>
          <label htmlFor="rt" className="mb-2 block font-display text-[18px] font-extrabold text-go-text">¿A qué hora?</label>
          <input id="rt" type="time" value={reminderTime} onChange={(e) => e.target.value && setSettings({ reminderTime: e.target.value })}
            className="w-full rounded-go border-2 border-go-border bg-go-surface px-4 py-3 font-display text-[24px] font-extrabold text-go-text outline-none focus:border-go-primary" />
        </section>

        <section>
          <h2 className="mb-2 font-display text-[18px] font-extrabold text-go-text">¿Qué días?</h2>
          <div className="flex justify-between gap-1" role="group" aria-label="Días de la semana">
            {DAYS.map((d) => {
              const on = reminderDays.includes(d.i)
              return (
                <button key={d.i} type="button" aria-pressed={on} aria-label={d.n} onClick={() => toggle(d.i)}
                  className={`h-11 w-11 rounded-full border-2 font-display text-[15px] font-extrabold ${on ? 'border-go-primary-dark bg-go-primary text-white' : 'border-go-border bg-white text-go-muted'}`}>
                  {d.l}
                </button>
              )
            })}
          </div>
          {reminderDays.length === 0 && <p className="mt-2 text-[13px] text-go-danger">Sin días elegidos, no te aviso nunca. ¿Seguro?</p>}
        </section>

        <p className="text-[14px] text-go-muted">Si tu racha corre peligro, te mandamos un empujoncito a esa hora. Cinco minutos alcanzan.</p>
        <Button block variant="secondary" onClick={test}><Bell size={18} strokeWidth={3} />Probar notificación</Button>
      </div>
    </div>
  )
}
