import { AlertTriangle, CheckCircle2, OctagonAlert, X } from 'lucide-react'
import { useEffect, useRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import type { RiskLevel, StudentStatus } from '@/data/admin'
import { RISK_LABEL, STATUS_LABEL } from '@/data/admin'

export const btnBase = 'inline-flex items-center justify-center gap-2 rounded px-4 py-2 font-display text-sm font-bold uppercase tracking-[0.05em] transition-colors disabled:cursor-not-allowed disabled:opacity-50'
const variants = {
  red: 'bg-go-danger text-white hover:bg-go-danger-dark',
  green: 'bg-go-primary text-white hover:bg-go-primary-dark',
  light: 'border border-go-border-dark bg-white text-go-primary hover:bg-go-primary-tint',
  onGreen: 'bg-white text-go-primary hover:bg-go-primary-tint',
}
export function AButton({ variant = 'red', className = '', ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof variants }) {
  return <button type="button" {...p} className={`${btnBase} ${variants[variant]} ${className}`} />
}

export function PageTitle({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-[28px] font-extrabold leading-tight text-go-primary">{title}</h1>
        {subtitle && <p className="mt-1 max-w-2xl text-sm text-go-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

export function Panel({ title, description, children, className = '', right }: { title?: string; description?: string; children: ReactNode; className?: string; right?: ReactNode }) {
  return (
    <section className={`rounded-md border border-go-border bg-white p-5 ${className}`}>
      {(title || right) && (
        <header className="mb-3 flex items-start justify-between gap-3">
          <div>
            {title && <h2 className="font-display text-lg font-bold text-go-text">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-go-muted">{description}</p>}
          </div>
          {right}
        </header>
      )}
      {children}
    </section>
  )
}

export function KpiCard({ label, value, hint, delta }: { label: string; value: string; hint?: string; delta?: string }) {
  return (
    <div className="rounded-md bg-go-primary p-4 text-white">
      <p className="text-[13px] font-medium text-white/90">{label}</p>
      <p className="mt-1 font-display text-[32px] font-extrabold leading-none">{value}</p>
      {delta && <p className="mt-2 inline-block rounded-sm bg-white px-2 py-0.5 text-xs font-bold text-go-primary">{delta}</p>}
      {hint && <p className="mt-2 text-xs text-white/85">{hint}</p>}
    </div>
  )
}

/** Semáforo: ícono + texto + color (nunca solo color). */
export function RiskBadge({ level }: { level: RiskLevel }) {
  const cfg = {
    bajo: { Icon: CheckCircle2, cls: 'bg-go-primary-tint text-go-primary', },
    medio: { Icon: AlertTriangle, cls: 'bg-[#FFF3CC] text-[#6B4A00]' },
    alto: { Icon: OctagonAlert, cls: 'bg-go-danger-tint text-go-danger' },
  }[level]
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-sm px-2 py-1 text-xs font-bold ${cfg.cls}`}>
      <cfg.Icon size={14} aria-hidden /> {RISK_LABEL[level]}
    </span>
  )
}
export function StatusBadge({ status }: { status: StudentStatus }) {
  const cls = { activo: 'text-go-primary', en_riesgo: 'text-[#6B4A00]', inactivo: 'text-go-danger' }[status]
  const dot = { activo: 'bg-go-primary', en_riesgo: 'bg-[#E0A100]', inactivo: 'bg-go-danger' }[status]
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-medium ${cls}`}>
      <span className={`h-2 w-2 rounded-full ${dot}`} aria-hidden /> {STATUS_LABEL[status]}
    </span>
  )
}

export function DemoNote({ children = 'Datos de demostración' }: { children?: ReactNode }) {
  return <p className="text-xs text-go-muted">{children}</p>
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="rounded-md border border-dashed border-go-border-dark bg-go-surface p-8 text-center text-sm text-go-muted">{children}</div>
}

/** Modal de escritorio con foco atrapado y cierre con Esc. */
export function AdminModal({ title, onClose, children, width = 'max-w-lg' }: { title: string; onClose: () => void; children: ReactNode; width?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    const el = ref.current
    const focusables = () => Array.from(el?.querySelectorAll<HTMLElement>('button,textarea,input,select,a[href]') ?? []).filter((x) => !x.hasAttribute('disabled'))
    ;(el?.querySelector<HTMLElement>('[data-autofocus]') ?? focusables()[0])?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key !== 'Tab') return
      const f = focusables()
      if (!f.length) return
      const first = f[0], last = f[f.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('keydown', onKey); prev?.focus() }
  }, [onClose])
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} role="dialog" aria-modal="true" aria-label={title} className={`w-full ${width} rounded-lg bg-white shadow-xl`}>
        <div className="flex items-center justify-between border-b border-go-border px-5 py-3">
          <h2 className="font-display text-lg font-bold text-go-primary">{title}</h2>
          <button type="button" aria-label="Cerrar" onClick={onClose} className="rounded p-1 text-go-muted hover:bg-go-surface"><X size={20} aria-hidden /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

export const inputCls = 'rounded border border-go-border-dark bg-white px-3 py-2 text-sm text-go-text placeholder:text-go-muted'
export const thCls = 'whitespace-nowrap bg-go-surface px-3 py-2.5 text-left text-xs font-bold uppercase tracking-wide text-go-muted'
export const tdCls = 'px-3 py-2.5 text-sm text-go-text'

export function fmtDate(key: string): string {
  const [y, m, d] = key.split('-')
  return `${d}/${m}/${y}`
}
export const money = (n: number) => '$' + n.toLocaleString('es-AR')
