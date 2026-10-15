import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { commissions as allCommissions, students as allStudents, teachers } from '@/data/admin'
import type { AdminStudent, Commission, Teacher } from '@/data/admin'
import { MessageModal } from './MessageModal'

export type Role = 'direccion' | 'docente'
export interface Session { role: Role; teacherId?: string }
const KEY = 'skills-go-admin-session'

export function readSession(): Session | null {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return null
    const s = JSON.parse(raw) as Session
    if (s.role === 'direccion' || (s.role === 'docente' && teachers.some((t) => t.id === s.teacherId))) return s
  } catch { /* sin storage */ }
  return null
}
function writeSession(s: Session | null) {
  try {
    if (s) sessionStorage.setItem(KEY, JSON.stringify(s))
    else sessionStorage.removeItem(KEY)
  } catch { /* sin storage */ }
}

interface Ctx {
  session: Session
  userLabel: string
  teacher?: Teacher
  students: AdminStudent[]
  commissions: Commission[]
  contacted: ReadonlySet<number>
  openMessage: (list: AdminStudent[]) => void
  toast: (msg: string) => void
  logout: () => void
}
const AdminCtx = createContext<Ctx | null>(null)
export function useAdmin(): Ctx {
  const c = useContext(AdminCtx)
  if (!c) throw new Error('useAdmin fuera de AdminProvider')
  return c
}
export function login(s: Session) { writeSession(s) }

export function AdminProvider({ session, onLogout, children }: { session: Session; onLogout: () => void; children: ReactNode }) {
  const [contacted, setContacted] = useState<ReadonlySet<number>>(new Set())
  const [msgTargets, setMsgTargets] = useState<AdminStudent[] | null>(null)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const teacher = session.role === 'docente' ? teachers.find((t) => t.id === session.teacherId) : undefined
  const students = useMemo(() => (teacher ? allStudents.filter((s) => s.teacherId === teacher.id) : allStudents), [teacher])
  const commissions = useMemo(() => (teacher ? allCommissions.filter((c) => c.teacherId === teacher.id) : allCommissions), [teacher])

  useEffect(() => {
    if (!toastMsg) return
    const t = setTimeout(() => setToastMsg(null), 3800)
    return () => clearTimeout(t)
  }, [toastMsg])

  const toast = useCallback((m: string) => setToastMsg(m), [])
  const openMessage = useCallback((l: AdminStudent[]) => setMsgTargets(l), [])
  const value: Ctx = {
    session, teacher, students, commissions, contacted, openMessage, toast,
    userLabel: teacher ? `Docente · ${teacher.name}` : 'Dirección',
    logout: onLogout,
  }
  return (
    <AdminCtx.Provider value={value}>
      {children}
      {msgTargets && (
        <MessageModal
          targets={msgTargets}
          onClose={() => setMsgTargets(null)}
          onSent={(ids) => {
            setContacted((prev) => new Set([...prev, ...ids]))
            setMsgTargets(null)
            toast(ids.length === 1 ? 'Mensaje enviado por WhatsApp (demo). Alumno marcado como contactado.' : `${ids.length} mensajes enviados por WhatsApp (demo). Alumnos marcados como contactados.`)
          }}
        />
      )}
      <div aria-live="polite" role="status" className="pointer-events-none fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 px-4">
        {toastMsg && <div className="rounded-md bg-go-text px-5 py-3 text-sm font-medium text-white shadow-lg">{toastMsg}</div>}
      </div>
    </AdminCtx.Provider>
  )
}
