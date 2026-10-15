import { useMemo } from 'react'
import { campaignStats, CHALLENGE_DAYS, MONTHLY_FEE, PRIZE_COST } from '@/data/admin'
import { useAdmin } from './AdminContext'
import { C, ChartCard } from './charts'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { DemoNote, KpiCard, money, PageTitle, Panel, tdCls, thCls } from './ui'

export default function CampaignPage() {
  const { students } = useAdmin()
  const c = useMemo(() => campaignStats(students), [students])
  const reach = c.reach.map((r) => ({ hito: `Día ${r.milestone}`, pct: r.pct, alumnos: r.students }))
  const delivered = c.prizes.reduce((a, p) => a + p.delivered, 0)
  const redeemed = c.prizes.reduce((a, p) => a + p.redeemed, 0)
  return (
    <>
      <PageTitle title="Campaña: Desafío de Vacaciones" subtitle={`${CHALLENGE_DAYS} días de racha con premios en los días 7, 14 y 21, canjeables en la academia.`} actions={<DemoNote />} />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Inscriptos" value={String(c.enrolled)} hint={`${c.enrolledPct} % de ${students.length} alumnos`} />
        <KpiCard label="Con racha en curso" value={String(c.onTrack)} hint="Siguen sumando días hoy" />
        <KpiCard label="Completaron los 21 días" value={String(c.completed)} />
        <KpiCard label="Premios entregados / canjeados" value={`${delivered} / ${redeemed}`} />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <ChartCard title="¿Cuántos llegan a cada hito?" description="Porcentaje de inscriptos que alcanzó el día 7, 14 y 21. La caída entre hitos muestra dónde se pierde gente." table={{ headers: ['Hito', '% de inscriptos', 'Alumnos'], rows: reach.map((r) => [r.hito, `${r.pct} %`, r.alumnos]) }}>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={reach} margin={{ top: 16, right: 12, bottom: 0, left: -8 }}>
              <CartesianGrid stroke={C.grid} vertical={false} />
              <XAxis dataKey="hito" tick={{ fontSize: 12, fill: '#4A4441' }} tickLine={false} axisLine={{ stroke: C.grid }} />
              <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 12, fill: '#4A4441' }} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: '#F5F2F0' }} formatter={(v: number, _n, p) => [`${v} % (${(p.payload as { alumnos: number }).alumnos} alumnos)`, 'Llegaron']} />
              <Bar isAnimationActive={false} dataKey="pct" name="% de inscriptos" fill={C.green} radius={[4, 4, 0, 0]} maxBarSize={80} label={{ position: 'top', fontSize: 12, fill: '#1B1B1B', formatter: (v: number) => `${v} %` }} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <Panel title="Premios por tipo" description="Premios entregados al alcanzar hitos y cuántos ya se canjearon en la academia.">
          <table className="w-full border-collapse">
            <caption className="sr-only">Premios por tipo</caption>
            <thead><tr><th scope="col" className={thCls}>Premio</th><th scope="col" className={thCls}>Entregados</th><th scope="col" className={thCls}>Canjeados</th><th scope="col" className={thCls}>Costo est.</th></tr></thead>
            <tbody>
              {c.prizes.map((p) => (
                <tr key={p.type} className="border-t border-go-border">
                  <th scope="row" className={`${tdCls} text-left font-medium`}>{p.label}<span className="block text-xs font-normal text-go-muted">{money(PRIZE_COST[p.type])} c/u</span></th>
                  <td className={tdCls}>{p.delivered}</td><td className={tdCls}>{p.redeemed}</td><td className={tdCls}>{money(p.cost)}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-go-border-dark font-bold"><th scope="row" className={`${tdCls} text-left`}>Total</th><td className={tdCls}>{delivered}</td><td className={tdCls}>{redeemed}</td><td className={tdCls}>{money(c.totalCost)}</td></tr>
            </tbody>
          </table>
        </Panel>
      </div>

      <section className="mt-5 rounded-md bg-go-primary p-6 text-white" aria-labelledby="retorno">
        <h2 id="retorno" className="font-display text-xl font-extrabold">Retorno estimado</h2>
        <dl className="mt-3 grid gap-4 sm:grid-cols-4">
          <div><dt className="text-sm text-white/90">Alumnos retenidos de más</dt><dd className="font-display text-2xl font-extrabold">{c.retainedExtra}</dd></div>
          <div><dt className="text-sm text-white/90">Cuota mensual (ficticia)</dt><dd className="font-display text-2xl font-extrabold">{money(MONTHLY_FEE)}</dd></div>
          <div><dt className="text-sm text-white/90">Ingreso retenido por mes</dt><dd className="font-display text-2xl font-extrabold">{money(c.monthlyReturn)}</dd></div>
          <div><dt className="text-sm text-white/90">Costo de premios</dt><dd className="font-display text-2xl font-extrabold">{money(c.totalCost)}</dd><dd className="text-xs text-white/90">Cada $1 de premios retiene ≈ ${c.roi} por mes</dd></div>
        </dl>
        <p className="mt-4 text-xs text-white/90">Estimaciones de demostración: precios, cuota y retención del año anterior son ficticios. Alumnos retenidos = alumnos × (retención con app − retención sin app).</p>
      </section>
    </>
  )
}
