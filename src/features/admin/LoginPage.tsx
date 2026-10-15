import { useState } from 'react'
import { Lockup } from '@/design'
import { teachers } from '@/data/admin'
import type { Session } from './AdminContext'
import { AButton, inputCls } from './ui'

export default function LoginPage({ onLogin }: { onLogin: (s: Session) => void }) {
  const [role, setRole] = useState<'direccion' | 'docente'>('direccion')
  const [teacherId, setTeacherId] = useState(teachers[0].id)
  return (
    <div className="min-h-screen bg-go-surface">
      <header className="border-b border-go-border bg-white py-4"><div className="flex justify-center"><Lockup height={56} /></div></header>
      <div className="h-2 bg-black" />
      <main className="mx-auto mt-12 w-full max-w-md px-4">
        <form
          className="rounded-md bg-go-primary p-8 text-white"
          onSubmit={(e) => { e.preventDefault(); onLogin(role === 'docente' ? { role, teacherId } : { role }) }}
        >
          <h1 className="font-display text-2xl font-extrabold">Panel de la academia</h1>
          <p className="mt-1 text-sm text-white/90">Entrá para ver cómo Skills Go cuida la retención de tus alumnos.</p>
          <fieldset className="mt-6">
            <legend className="mb-2 text-sm font-medium">¿Cómo ingresás?</legend>
            <div className="grid grid-cols-2 gap-2">
              {([['direccion', 'Dirección'], ['docente', 'Docente']] as const).map(([v, l]) => (
                <label key={v} className={`cursor-pointer rounded border-2 px-3 py-2.5 text-center text-sm font-bold has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-go-xp ${role === v ? 'border-white bg-white text-go-primary' : 'border-white/50 text-white'}`}>
                  <input type="radio" name="rol" value={v} checked={role === v} onChange={() => setRole(v)} className="sr-only" />
                  {l}
                </label>
              ))}
            </div>
          </fieldset>
          {role === 'docente' && (
            <div className="mt-4">
              <label htmlFor="docente" className="mb-1 block text-sm font-medium">Docente</label>
              <select id="docente" value={teacherId} onChange={(e) => setTeacherId(e.target.value)} className={`${inputCls} w-full`}>
                {teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <p className="mt-1 text-xs text-white/85">Vas a ver solamente tus comisiones.</p>
            </div>
          )}
          <AButton type="submit" className="mt-6 w-full py-3">Ingresar</AButton>
          <p className="mt-3 text-center text-xs text-white/85">Demo: no hace falta contraseña</p>
        </form>
        <p className="mt-4 text-center text-xs text-go-muted">Datos de demostración</p>
      </main>
    </div>
  )
}
