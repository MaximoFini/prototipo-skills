import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowDown, ArrowUp, ChevronsUpDown, Download, Search } from 'lucide-react'
import { downloadCsv, filterStudents, riskLevel, sortStudents, studentStatus, studentsCsv } from '@/data/admin'
import type { Level, SortKey, StudentStatus } from '@/data/admin'
import { useAdmin } from './AdminContext'
import { AButton, EmptyState, fmtDate, inputCls, PageTitle, RiskBadge, StatusBadge, tdCls, thCls } from './ui'

const PAGE_SIZE = 15

export default function StudentsPage() {
  const { students, commissions } = useAdmin()
  const [params, setParams] = useSearchParams()
  const commission = params.get('comision') ?? ''
  const [q, setQ] = useState('')
  const [level, setLevel] = useState<Level | ''>('')
  const [status, setStatus] = useState<StudentStatus | ''>('')
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'name', dir: 'asc' })
  const [page, setPage] = useState(0)

  const rows = useMemo(() => sortStudents(filterStudents(students, { q, commission, level, status }), sort.key, sort.dir), [students, q, commission, level, status, sort])
  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const cur = Math.min(page, pages - 1)
  const view = rows.slice(cur * PAGE_SIZE, (cur + 1) * PAGE_SIZE)
  const reset = <T,>(fn: (v: T) => void) => (v: T) => { fn(v); setPage(0) }

  const toggle = (key: SortKey) => setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: key === 'name' || key === 'daysInactive' ? 'asc' : 'desc' }))
  const SortTh = ({ k, children }: { k: SortKey; children: string }) => (
    <th scope="col" className={thCls} aria-sort={sort.key === k ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
      <button type="button" onClick={() => toggle(k)} className="inline-flex items-center gap-1 font-bold uppercase tracking-wide hover:text-go-text" aria-label={`Ordenar por ${children}`}>
        {children}
        {sort.key === k ? (sort.dir === 'asc' ? <ArrowUp size={13} aria-hidden /> : <ArrowDown size={13} aria-hidden />) : <ChevronsUpDown size={13} aria-hidden />}
      </button>
    </th>
  )

  return (
    <>
      <PageTitle
        title="Alumnos"
        subtitle={`${rows.length} de ${students.length} alumnos${commission ? ` · comisión ${commissions.find((c) => c.id === commission)?.name ?? ''}` : ''}`}
        actions={<AButton variant="green" onClick={() => downloadCsv('alumnos-skills-go.csv', studentsCsv(rows))} aria-label="Exportar CSV con los alumnos filtrados"><Download size={16} aria-hidden /> Exportar CSV</AButton>}
      />
      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-md border border-go-border bg-white p-4">
        <div className="min-w-[220px] flex-1">
          <label htmlFor="f-q" className="mb-1 block text-xs font-bold text-go-muted">Buscar</label>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-go-muted" aria-hidden />
            <input id="f-q" type="search" value={q} onChange={(e) => reset(setQ)(e.target.value)} placeholder="Nombre o apellido" className={`${inputCls} w-full pl-9`} />
          </div>
        </div>
        <div>
          <label htmlFor="f-c" className="mb-1 block text-xs font-bold text-go-muted">Comisión</label>
          <select id="f-c" value={commission} onChange={(e) => { setParams(e.target.value ? { comision: e.target.value } : {}); setPage(0) }} className={inputCls}>
            <option value="">Todas</option>
            {commissions.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="f-l" className="mb-1 block text-xs font-bold text-go-muted">Nivel</label>
          <select id="f-l" value={level} onChange={(e) => reset(setLevel)(e.target.value as Level | '')} className={inputCls}>
            <option value="">Todos</option><option value="A1">A1</option><option value="A2">A2</option><option value="B1">B1</option>
          </select>
        </div>
        <div>
          <label htmlFor="f-s" className="mb-1 block text-xs font-bold text-go-muted">Estado</label>
          <select id="f-s" value={status} onChange={(e) => reset(setStatus)(e.target.value as StudentStatus | '')} className={inputCls}>
            <option value="">Todos</option><option value="activo">Activo</option><option value="en_riesgo">En riesgo</option><option value="inactivo">Inactivo</option>
          </select>
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState>No hay alumnos con esos filtros. Probá sacar alguno.</EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-md border border-go-border bg-white">
          <table className="w-full min-w-[820px] border-collapse">
            <caption className="sr-only">Listado de alumnos</caption>
            <thead>
              <tr>
                <SortTh k="name">Alumno</SortTh>
                <th scope="col" className={thCls}>Comisión</th>
                <th scope="col" className={thCls}>Nivel</th>
                <SortTh k="streak">Racha</SortTh>
                <SortTh k="xpWeek">XP semanal</SortTh>
                <SortTh k="daysInactive">Última actividad</SortTh>
                <th scope="col" className={thCls}>Estado</th>
                <th scope="col" className={thCls}>Riesgo</th>
              </tr>
            </thead>
            <tbody>
              {view.map((s) => (
                <tr key={s.id} className="border-t border-go-border hover:bg-go-primary-tint/50">
                  <th scope="row" className={`${tdCls} text-left font-medium`}>
                    <Link to={`/admin/alumnos/${s.id}`} className="text-go-primary underline-offset-2 hover:underline">{s.name}</Link>
                    <span className="block text-xs font-normal text-go-muted">{s.age} años</span>
                  </th>
                  <td className={tdCls}>{s.commission}</td>
                  <td className={tdCls}>{s.level}</td>
                  <td className={tdCls}>{s.streak} {s.streak === 1 ? 'día' : 'días'}</td>
                  <td className={tdCls}>{s.xpWeek}</td>
                  <td className={tdCls}>{s.daysInactive === 0 ? 'Hoy' : s.daysInactive === 1 ? 'Ayer' : `Hace ${s.daysInactive} días`}<span className="block text-xs text-go-muted">{fmtDate(s.lastActiveDate)}</span></td>
                  <td className={tdCls}><StatusBadge status={studentStatus(s)} /></td>
                  <td className={tdCls}><RiskBadge level={riskLevel(s)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <nav aria-label="Paginación" className="mt-4 flex items-center justify-between text-sm">
        <span className="text-go-muted">Mostrando {rows.length ? cur * PAGE_SIZE + 1 : 0}–{Math.min(rows.length, (cur + 1) * PAGE_SIZE)} de {rows.length}</span>
        <div className="flex items-center gap-2">
          <AButton variant="light" disabled={cur === 0} onClick={() => setPage(cur - 1)}>Anterior</AButton>
          <span aria-current="page">Página {cur + 1} de {pages}</span>
          <AButton variant="light" disabled={cur >= pages - 1} onClick={() => setPage(cur + 1)}>Siguiente</AButton>
        </div>
      </nav>
    </>
  )
}
