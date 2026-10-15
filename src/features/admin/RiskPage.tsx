import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Download, MessageCircle, Send } from 'lucide-react'
import { atRiskStudents, downloadCsv, riskCsv, riskLevel } from '@/data/admin'
import { useAdmin } from './AdminContext'
import { AButton, EmptyState, fmtDate, PageTitle, RiskBadge, tdCls, thCls } from './ui'

export default function RiskPage() {
  const { students, contacted, openMessage } = useAdmin()
  const list = useMemo(() => atRiskStudents(students), [students])
  const pending = list.filter((s) => !contacted.has(s.id))
  const done = list.length - pending.length
  return (
    <>
      <PageTitle
        title="Alumnos en riesgo"
        subtitle="Alumnos con 3 o más días sin practicar, o que perdieron una racha hace poco. Un mensaje a tiempo los trae de vuelta."
        actions={
          <>
            <AButton variant="light" onClick={() => downloadCsv('alumnos-en-riesgo.csv', riskCsv(list, contacted))} aria-label="Exportar CSV de alumnos en riesgo"><Download size={16} aria-hidden /> Exportar CSV</AButton>
            <AButton disabled={pending.length === 0} onClick={() => openMessage(pending)}><Send size={16} aria-hidden /> Enviar a todos ({pending.length})</AButton>
          </>
        }
      />
      <p className="mb-3 text-sm" aria-live="polite">
        <strong className="text-go-primary">{done}</strong> contactados · <strong className="text-go-danger">{pending.length}</strong> por contactar · {list.length} en total
      </p>
      {list.length === 0 ? (
        <EmptyState>Ningún alumno en riesgo. ¡Todo el grupo está practicando!</EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-md border border-go-border bg-white">
          <table className="w-full min-w-[900px] border-collapse">
            <caption className="sr-only">Alumnos en riesgo de abandonar</caption>
            <thead>
              <tr>
                <th scope="col" className={thCls}>Alumno</th>
                <th scope="col" className={thCls}>Comisión</th>
                <th scope="col" className={thCls}>Días sin practicar</th>
                <th scope="col" className={thCls}>Racha perdida</th>
                <th scope="col" className={thCls}>Última actividad</th>
                <th scope="col" className={thCls}>Nivel de riesgo</th>
                <th scope="col" className={thCls}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {list.map((s) => (
                <tr key={s.id} className="border-t border-go-border">
                  <th scope="row" className={`${tdCls} text-left font-medium`}><Link to={`/admin/alumnos/${s.id}`} className="text-go-primary hover:underline">{s.name}</Link></th>
                  <td className={tdCls}>{s.commission}</td>
                  <td className={tdCls}>{s.daysInactive}</td>
                  <td className={tdCls}>{s.lostStreak > 0 ? `${s.lostStreak} días` : '—'}</td>
                  <td className={tdCls}>{fmtDate(s.lastActiveDate)}</td>
                  <td className={tdCls}><RiskBadge level={riskLevel(s)} /></td>
                  <td className={tdCls}>
                    {contacted.has(s.id) ? (
                      <span className="inline-flex items-center gap-1 text-sm font-bold text-go-primary"><MessageCircle size={15} aria-hidden /> Contactado</span>
                    ) : (
                      <AButton className="px-3 py-1.5 text-xs" onClick={() => openMessage([s])} aria-label={`Enviar mensaje a ${s.name}`}>Enviar mensaje</AButton>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
