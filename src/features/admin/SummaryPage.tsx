import { useMemo } from 'react'
import { commissionStats, computeKpis, dailyActivity, RETENTION, streakHistogram } from '@/data/admin'
import { useAdmin } from './AdminContext'
import { ActivityChart, CommissionChart, RetentionChart, StreakHistogram } from './charts'
import { DemoNote, KpiCard, PageTitle, Panel } from './ui'

export default function SummaryPage() {
  const { students, commissions, teacher } = useAdmin()
  const k = useMemo(() => computeKpis(students), [students])
  const daily = useMemo(() => dailyActivity(students, 30), [students])
  const comm = useMemo(() => commissionStats(students, commissions), [students, commissions])
  const hist = useMemo(() => streakHistogram(students), [students])
  const pct = (n: number) => (k.total ? Math.round((n / k.total) * 100) : 0)
  const delta = RETENTION.current - RETENTION.previous
  return (
    <>
      <PageTitle
        title="Resumen"
        subtitle={teacher ? `Tus comisiones: ${commissions.map((c) => c.name).join(', ')} · ${k.total} alumnos.` : `Así va la práctica de los ${k.total} alumnos de la academia durante las vacaciones.`}
        actions={<DemoNote />}
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Activos hoy" value={String(k.activeToday)} hint={`${pct(k.activeToday)} % de ${k.total} alumnos`} />
        <KpiCard label="Activos esta semana" value={String(k.activeWeek)} hint={`${pct(k.activeWeek)} % de ${k.total} alumnos`} />
        <KpiCard label="Activos este mes" value={String(k.activeMonth)} hint={`${pct(k.activeMonth)} % de ${k.total} alumnos`} />
        <KpiCard label="Retención en vacaciones" value={`${RETENTION.current} %`} delta={`+${delta} pts vs. año anterior`} hint={`Año anterior sin app: ${RETENTION.previous} %`} />
        <KpiCard label="Racha promedio" value={`${k.avgStreak} días`} hint="Sobre todos los alumnos" />
        <KpiCard label="Lecciones por día" value={String(k.lessonsPerDay)} hint="Promedio de los últimos 7 días" />
        <KpiCard label="XP semanal total" value={k.xpWeek.toLocaleString('es-AR')} hint="Suma de todos los alumnos" />
        <KpiCard label="En el Desafío de Vacaciones" value={String(k.inChallenge)} hint={`${pct(k.inChallenge)} % de los alumnos`} />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <ActivityChart data={daily} />
        <RetentionChart />
        <CommissionChart data={comm} />
        <StreakHistogram data={hist} />
      </div>

      <Panel className="mt-5" title="Efecto de la app en la retención">
        <dl className="grid gap-4 text-sm sm:grid-cols-3">
          <div><dt className="text-go-muted">Retención en vacaciones</dt><dd className="font-display text-xl font-extrabold text-go-primary">{RETENTION.current} % <span className="text-sm font-medium text-go-muted">con Skills Go · {RETENTION.previous} % sin app</span></dd></div>
          <div><dt className="text-go-muted">Re-inscripción proyectada</dt><dd className="font-display text-xl font-extrabold text-go-primary">{RETENTION.reenrollCurrent} % <span className="text-sm font-medium text-go-muted">vs. {RETENTION.reenrollPrevious} % del año pasado</span></dd></div>
          <div><dt className="text-go-muted">Alumnos retenidos de más</dt><dd className="font-display text-xl font-extrabold text-go-primary">{Math.round(k.total * delta / 100)} <span className="text-sm font-medium text-go-muted">sobre {k.total} alumnos</span></dd></div>
        </dl>
        <p className="mt-3 text-xs text-go-muted">Datos de demostración: las cifras de retención del año anterior y la re-inscripción son ficticias.</p>
      </Panel>
    </>
  )
}
