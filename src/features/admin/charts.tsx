import type { ReactNode } from 'react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { DayPoint, GroupStats } from '@/data/admin'
import { retentionSeries } from '@/data/admin'
import { Panel } from './ui'

/** Paleta de gráficos: verde Skills, rojo Skills, gris texto-suave. Todos >= 3:1 sobre blanco. */
export const C = { green: '#00522E', red: '#B8252B', gray: '#6B6360', grid: '#E4DDD9', ink: '#1B1B1B' }
const axis = { fontSize: 12, fill: '#4A4441' }
const tip = { contentStyle: { borderRadius: 6, border: '1px solid #CFC6C1', fontSize: 13 }, labelStyle: { fontWeight: 700 } }

export function ChartCard({ title, description, table, children }: { title: string; description: string; table: { headers: string[]; rows: (string | number)[][] }; children: ReactNode }) {
  return (
    <Panel title={title} description={description}>
      <div role="img" aria-label={`${title}. ${description}`}>{children}</div>
      <details className="mt-2 text-sm">
        <summary className="cursor-pointer text-go-primary underline underline-offset-2">Ver datos en tabla</summary>
        <div className="mt-2 max-h-48 overflow-auto">
          <table className="w-full text-left text-xs">
            <caption className="sr-only">{title}</caption>
            <thead><tr>{table.headers.map((h) => <th key={h} scope="col" className="bg-go-surface px-2 py-1 font-bold">{h}</th>)}</tr></thead>
            <tbody>{table.rows.map((r, i) => <tr key={i} className="border-t border-go-border">{r.map((c, j) => (j === 0 ? <th key={j} scope="row" className="px-2 py-1 font-medium">{c}</th> : <td key={j} className="px-2 py-1">{c}</td>))}</tr>)}</tbody>
          </table>
        </div>
      </details>
    </Panel>
  )
}

export function ActivityChart({ data }: { data: DayPoint[] }) {
  return (
    <ChartCard title="Actividad diaria" description="Alumnos que practicaron cada día en los últimos 30 días. Buscá si los fines de semana o feriados bajan la curva." table={{ headers: ['Día', 'Alumnos activos', 'Lecciones'], rows: data.map((d) => [d.label, d.active, d.lessons]) }}>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -8 }}>
          <CartesianGrid stroke={C.grid} vertical={false} />
          <XAxis dataKey="label" tick={axis} interval={4} tickLine={false} axisLine={{ stroke: C.grid }} />
          <YAxis tick={axis} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip {...tip} formatter={(v: number) => [`${v} alumnos`, 'Activos']} labelFormatter={(l: string) => `Día ${l}`} />
          <Area type="monotone" dataKey="active" name="Alumnos activos" stroke={C.green} strokeWidth={2} fill={C.green} fillOpacity={0.14} activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2 }} />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

export function CommissionChart({ data }: { data: GroupStats[] }) {
  return (
    <ChartCard title="Activos por comisión" description="Porcentaje de cada comisión que practicó en la última semana. Las barras más cortas piden una charla con el docente." table={{ headers: ['Comisión', '% activos en la semana', 'Alumnos'], rows: data.map((d) => [d.name, `${d.activeWeekPct} %`, d.students]) }}>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, bottom: 0, left: 4 }}>
          <CartesianGrid stroke={C.grid} horizontal={false} />
          <XAxis type="number" domain={[0, 100]} unit="%" tick={axis} tickLine={false} axisLine={{ stroke: C.grid }} />
          <YAxis type="category" dataKey="name" width={80} tick={axis} tickLine={false} axisLine={false} />
          <Tooltip {...tip} cursor={{ fill: '#F5F2F0' }} formatter={(v: number) => [`${v} %`, 'Activos en la semana']} />
          <Bar dataKey="activeWeekPct" name="% activos en la semana" fill={C.green} radius={[0, 4, 4, 0]} maxBarSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

export function StreakHistogram({ data }: { data: { label: string; alumnos: number }[] }) {
  return (
    <ChartCard title="Distribución de rachas" description="Cuántos alumnos hay en cada tramo de días de racha. Cuantos más a la derecha, más hábito." table={{ headers: ['Días de racha', 'Alumnos'], rows: data.map((d) => [d.label, d.alumnos]) }}>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 8, right: 12, bottom: 16, left: -8 }} barCategoryGap={2}>
          <CartesianGrid stroke={C.grid} vertical={false} />
          <XAxis dataKey="label" tick={axis} tickLine={false} axisLine={{ stroke: C.grid }} label={{ value: 'Días de racha', position: 'insideBottom', offset: -10, style: axis }} />
          <YAxis tick={axis} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip {...tip} cursor={{ fill: '#F5F2F0' }} formatter={(v: number) => [`${v} alumnos`, 'Alumnos']} labelFormatter={(l: string) => `Racha de ${l} días`} />
          <Bar dataKey="alumnos" name="Alumnos" fill={C.green} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

export function RetentionChart() {
  return (
    <ChartCard title="Retención por semana de vacaciones" description="Qué porcentaje del grupo sigue practicando semana a semana, con Skills Go y el año pasado sin app. La brecha es el efecto de la app." table={{ headers: ['Semana', 'Con Skills Go', 'Año anterior (sin app)'], rows: retentionSeries.map((r) => [r.semana, `${r.conApp} %`, `${r.anioAnterior} %`]) }}>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={retentionSeries} margin={{ top: 8, right: 16, bottom: 0, left: -8 }}>
          <CartesianGrid stroke={C.grid} vertical={false} />
          <XAxis dataKey="semana" tick={axis} tickLine={false} axisLine={{ stroke: C.grid }} />
          <YAxis domain={[50, 100]} unit="%" tick={axis} tickLine={false} axisLine={false} />
          <Tooltip {...tip} formatter={(v: number, n: string) => [`${v} %`, n]} />
          <Legend verticalAlign="top" height={30} iconType="plainline" wrapperStyle={{ fontSize: 13 }} />
          <Line type="monotone" dataKey="conApp" name="Con Skills Go" stroke={C.green} strokeWidth={3} dot={{ r: 4, fill: C.green, stroke: '#fff', strokeWidth: 2 }} />
          <Line type="monotone" dataKey="anioAnterior" name="Año anterior (sin app)" stroke={C.gray} strokeWidth={2} strokeDasharray="6 4" dot={{ r: 4, fill: C.gray, stroke: '#fff', strokeWidth: 2 }} />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

export function CompareBars({ data, dataKey, name, unit = '' }: { data: { name: string; [k: string]: string | number }[]; dataKey: string; name: string; unit?: string }) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(180, data.length * 34 + 30)}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, bottom: 0, left: 4 }}>
        <CartesianGrid stroke={C.grid} horizontal={false} />
        <XAxis type="number" unit={unit} tick={axis} tickLine={false} axisLine={{ stroke: C.grid }} />
        <YAxis type="category" dataKey="name" width={110} tick={axis} tickLine={false} axisLine={false} />
        <Tooltip {...tip} cursor={{ fill: '#F5F2F0' }} formatter={(v: number) => [`${v}${unit}`, name]} />
        <Bar dataKey={dataKey} name={name} fill={C.green} radius={[0, 4, 4, 0]} maxBarSize={18} />
      </BarChart>
    </ResponsiveContainer>
  )
}
