import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { commissionStats, teacherStats, teachers } from '@/data/admin'
import { useAdmin } from './AdminContext'
import { CompareBars, ChartCard } from './charts'
import { PageTitle, Panel, tdCls, thCls } from './ui'

export default function CommissionsPage() {
  const { students, commissions } = useAdmin()
  const comm = useMemo(() => commissionStats(students, commissions), [students, commissions])
  const profs = useMemo(() => teacherStats(students, teachers), [students])
  return (
    <>
      <PageTitle title="Comisiones y docentes" subtitle="Ranking por participación: qué porcentaje practicó en la última semana. Tocá una comisión para ver sus alumnos." />
      <Panel title="Ranking de comisiones">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse">
            <caption className="sr-only">Ranking de comisiones por participación</caption>
            <thead><tr>
              <th scope="col" className={thCls}>#</th><th scope="col" className={thCls}>Comisión</th><th scope="col" className={thCls}>Alumnos</th>
              <th scope="col" className={thCls}>% activos en la semana</th><th scope="col" className={thCls}>Racha promedio</th><th scope="col" className={thCls}>XP semanal</th><th scope="col" className={thCls}>En riesgo</th>
            </tr></thead>
            <tbody>
              {comm.map((c, i) => (
                <tr key={c.id} className="border-t border-go-border">
                  <td className={tdCls}>{i + 1}</td>
                  <th scope="row" className={`${tdCls} text-left`}><Link to={`/admin/alumnos?comision=${c.id}`} className="font-medium text-go-primary underline-offset-2 hover:underline" aria-label={`Ver alumnos de ${c.name}`}>{c.name}</Link></th>
                  <td className={tdCls}>{c.students}</td>
                  <td className={tdCls}>
                    <span className="inline-flex items-center gap-2"><span className="h-2.5 w-24 rounded-sm bg-go-border" aria-hidden><span className="block h-full rounded-sm bg-go-primary" style={{ width: `${c.activeWeekPct}%` }} /></span>{c.activeWeekPct} %</span>
                  </td>
                  <td className={tdCls}>{c.avgStreak} días</td>
                  <td className={tdCls}>{c.xpWeek.toLocaleString('es-AR')}</td>
                  <td className={tdCls}>{c.atRisk}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <ChartCard title="Racha promedio por comisión" description="Días de racha promedio de cada comisión: mide el hábito, no solo la presencia." table={{ headers: ['Comisión', 'Racha promedio'], rows: comm.map((c) => [c.name, c.avgStreak]) }}>
          <CompareBars data={comm.map((c) => ({ name: c.name, racha: c.avgStreak }))} dataKey="racha" name="Racha promedio (días)" />
        </ChartCard>
        <ChartCard title="XP semanal por comisión" description="XP total que sumó cada comisión esta semana." table={{ headers: ['Comisión', 'XP semanal'], rows: comm.map((c) => [c.name, c.xpWeek]) }}>
          <CompareBars data={comm.map((c) => ({ name: c.name, xp: c.xpWeek }))} dataKey="xp" name="XP semanal" />
        </ChartCard>
      </div>

      <Panel className="mt-5" title="Ranking de docentes" description="Participación sumando todas las comisiones de cada docente.">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse">
            <caption className="sr-only">Ranking de docentes por participación</caption>
            <thead><tr>
              <th scope="col" className={thCls}>#</th><th scope="col" className={thCls}>Docente</th><th scope="col" className={thCls}>Comisiones</th><th scope="col" className={thCls}>Alumnos</th>
              <th scope="col" className={thCls}>% activos en la semana</th><th scope="col" className={thCls}>Racha promedio</th>
            </tr></thead>
            <tbody>
              {profs.map((t, i) => (
                <tr key={t.id} className="border-t border-go-border">
                  <td className={tdCls}>{i + 1}</td>
                  <th scope="row" className={`${tdCls} text-left font-medium`}>{t.name}</th>
                  <td className={tdCls}>{t.commissions.join(', ')}</td>
                  <td className={tdCls}>{t.students}</td>
                  <td className={tdCls}>{t.activeWeekPct} %</td>
                  <td className={tdCls}>{t.avgStreak} días</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  )
}
