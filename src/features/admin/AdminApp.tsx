import { lazy, Suspense, useState } from 'react'
import { Navigate, NavLink, Route, Routes, Link, useLocation } from 'react-router-dom'
import { LogOut, Smartphone } from 'lucide-react'
import { Lockup } from '@/design'
import { AdminProvider, login, readSession, useAdmin, type Session } from './AdminContext'
import LoginPage from './LoginPage'

const SummaryPage = lazy(() => import('./SummaryPage'))
const StudentsPage = lazy(() => import('./StudentsPage'))
const StudentDetailPage = lazy(() => import('./StudentDetailPage'))
const RiskPage = lazy(() => import('./RiskPage'))
const CommissionsPage = lazy(() => import('./CommissionsPage'))
const CampaignPage = lazy(() => import('./CampaignPage'))

const NAV = [
  { to: '/admin', label: 'Resumen', end: true },
  { to: '/admin/alumnos', label: 'Alumnos' },
  { to: '/admin/riesgo', label: 'En riesgo' },
  { to: '/admin/comisiones', label: 'Comisiones' },
  { to: '/admin/campana', label: 'Campaña' },
]

const FOCUS_CSS = `
.admin-root :focus-visible{outline:3px solid #1D5FB0;outline-offset:2px}
.admin-nav :focus-visible{outline-color:#F2C94C;outline-offset:-3px}
.admin-root{font-family:Roboto,system-ui,sans-serif}
`

function Shell() {
  const { userLabel, logout } = useAdmin()
  return (
    <div className="admin-root flex min-h-screen flex-col bg-go-surface text-go-text">
      <style>{FOCUS_CSS}</style>
      <a href="#contenido" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2">Saltar al contenido</a>
      <header className="border-b border-go-border bg-white">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-3 px-6 py-3">
          <div className="flex items-center gap-4">
            <Lockup height={48} />
            <div className="border-l border-go-border pl-4">
              <p className="font-display text-lg font-extrabold leading-tight text-go-primary">Skills Go</p>
              <p className="text-sm text-go-muted">Panel de la academia</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-go-muted">Sesión: <strong className="font-medium text-go-text">{userLabel}</strong></span>
            <button type="button" onClick={logout} className="inline-flex items-center gap-1.5 rounded border border-go-border-dark px-3 py-1.5 font-medium text-go-text hover:bg-go-surface">
              <LogOut size={16} aria-hidden /> Cerrar sesión
            </button>
          </div>
        </div>
      </header>
      <nav aria-label="Secciones del panel" className="admin-nav bg-black">
        <ul className="mx-auto flex max-w-[1280px] flex-wrap items-stretch px-3">
          {NAV.map((n) => (
            <li key={n.to}>
              <NavLink to={n.to} end={n.end} className={({ isActive }) => `block px-4 py-3 text-[15px] font-medium text-white hover:bg-white/15 ${isActive ? 'border-b-4 border-go-danger bg-white/10 font-bold' : 'border-b-4 border-transparent'}`}>
                {n.label}
              </NavLink>
            </li>
          ))}
          <li className="ml-auto">
            <Link to="/" className="flex items-center gap-1.5 px-4 py-3 text-[15px] text-white underline-offset-4 hover:bg-white/15 hover:underline">
              <Smartphone size={16} aria-hidden /> Ver app del alumno
            </Link>
          </li>
        </ul>
      </nav>
      <main id="contenido" className="mx-auto w-full max-w-[1280px] flex-1 px-6 py-6">
        <Suspense fallback={<p className="p-8 text-go-muted" role="status">Cargando…</p>}>
          <Routes>
            <Route index element={<SummaryPage />} />
            <Route path="alumnos" element={<StudentsPage />} />
            <Route path="alumnos/:id" element={<StudentDetailPage />} />
            <Route path="riesgo" element={<RiskPage />} />
            <Route path="comisiones" element={<CommissionsPage />} />
            <Route path="campana" element={<CampaignPage />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </Suspense>
      </main>
      <footer className="border-t border-go-border bg-white px-6 py-3 text-center text-xs text-go-muted">
        Datos de demostración · Skills English Institute · Building Skills
      </footer>
    </div>
  )
}

export default function AdminApp() {
  const [session, setSession] = useState<Session | null>(() => readSession())
  const loc = useLocation()
  const onLogin = (s: Session) => { login(s); setSession(s) }
  const onLogout = () => { try { sessionStorage.removeItem('skills-go-admin-session') } catch { /* noop */ } setSession(null) }
  const atLogin = loc.pathname.replace(/\/$/, '') === '/admin/login'

  if (!session) {
    if (!atLogin) return <Navigate to="/admin/login" replace />
    return <LoginPage onLogin={onLogin} />
  }
  if (atLogin) return <Navigate to="/admin" replace />
  return (
    <AdminProvider session={session} onLogout={onLogout}>
      <Shell />
    </AdminProvider>
  )
}
