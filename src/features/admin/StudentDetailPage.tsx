import { ArrowLeft, Award, Flame, MessageCircle, Zap } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { CHALLENGE_DAYS, PRIZE_LABEL, riskLevel, studentStatus } from '@/data/admin'
import { useAdmin } from './AdminContext'
import { Heatmap } from './Heatmap'
import { AButton, EmptyState, fmtDate, PageTitle, Panel, RiskBadge, StatusBadge } from './ui'

const UNITS = ['1. Hello!', '2. Me & my world', '3. My day', '4. Food & hangouts', '5. Weekend plans', '6. Social media & tech', '7. Travel & dreams']

function Stat({ label, value, Icon }: { label: string; value: string; Icon?: typeof Flame }) {
  return (
    <div className="rounded-md bg-go-primary p-4 text-white">
      <p className="flex items-center gap-1.5 text-[13px] text-white/90">{Icon && <Icon size={14} aria-hidden />}{label}</p>
      <p className="mt-1 font-display text-2xl font-extrabold">{value}</p>
    </div>
  )
}

export default function StudentDetailPage() {
  const { id } = useParams()
  const { students, contacted, openMessage } = useAdmin()
  const s = students.find((x) => String(x.id) === id)
  if (!s) {
    return (
      <>
        <Link to="/admin/alumnos" className="mb-4 inline-flex items-center gap-1 text-sm text-go-primary hover:underline"><ArrowLeft size={16} aria-hidden /> Volver a alumnos</Link>
        <EmptyState>No encontramos a ese alumno (o no pertenece a tus comisiones).</EmptyState>
      </>
    )
  }
  const v = s.vacation
  const sum60 = s.history.reduce((a, b) => a + b, 0)
  return (
    <>
      <Link to="/admin/alumnos" className="mb-3 inline-flex items-center gap-1 text-sm text-go-primary hover:underline"><ArrowLeft size={16} aria-hidden /> Volver a alumnos</Link>
      <PageTitle
        title={s.name}
        subtitle={`${s.age} años · ${s.commission} · Nivel ${s.level}`}
        actions={
          contacted.has(s.id)
            ? <span className="inline-flex items-center gap-1 text-sm font-bold text-go-primary"><MessageCircle size={16} aria-hidden /> Contactado</span>
            : <AButton onClick={() => openMessage([s])}><MessageCircle size={16} aria-hidden /> Enviar mensaje</AButton>
        }
      />
      <div className="mb-4 flex flex-wrap items-center gap-4"><StatusBadge status={studentStatus(s)} /><RiskBadge level={riskLevel(s)} />
        <span className="text-sm text-go-muted">Última actividad: {s.daysInactive === 0 ? 'hoy' : s.daysInactive === 1 ? 'ayer' : `hace ${s.daysInactive} días`} ({fmtDate(s.lastActiveDate)})</span></div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Racha actual" value={`${s.streak} días`} Icon={Flame} />
        <Stat label="Mejor racha" value={`${s.bestStreak} días`} Icon={Flame} />
        <Stat label="XP de la semana" value={String(s.xpWeek)} Icon={Zap} />
        <Stat label="XP total" value={s.xpTotal.toLocaleString('es-AR')} Icon={Zap} />
      </div>
      {s.lostStreak > 0 && <p className="mt-3 rounded-md border border-go-danger/40 bg-go-danger-tint p-3 text-sm text-go-danger">Perdió una racha de {s.lostStreak} días. Un mensaje a tiempo ayuda a que vuelva.</p>}

      <div className="mt-5 grid gap-5 lg:grid-cols-5">
        <Panel className="lg:col-span-3" title="Actividad de los últimos 60 días" description={`${s.history.filter((n) => n > 0).length} días con práctica y ${sum60} lecciones en total (${s.lessonsCompleted} completadas desde que se sumó).`}>
          <Heatmap history={s.history} />
        </Panel>
        <Panel className="lg:col-span-2" title="Progreso por unidad" description="Porcentaje completado de cada unidad del curso.">
          <ul className="space-y-2.5">
            {UNITS.map((u, i) => (
              <li key={u}>
                <div className="flex justify-between text-sm"><span>{u}</span><span className="font-medium">{s.unitProgress[i]} %</span></div>
                <div className="mt-1 h-2.5 rounded-sm bg-go-border" role="progressbar" aria-label={`Progreso en ${u}`} aria-valuenow={s.unitProgress[i]} aria-valuemin={0} aria-valuemax={100}>
                  <div className="h-full rounded-sm bg-go-primary" style={{ width: `${s.unitProgress[i]}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel className="mt-5" title="Desafío de Vacaciones" description="21 días de racha con premios en los días 7, 14 y 21.">
        {!v.enrolled ? (
          <p className="text-sm text-go-muted">Todavía no se sumó al desafío. Es una buena excusa para escribirle.</p>
        ) : (
          <>
            <p className="text-sm">
              Va por el <strong>día {v.day} de {CHALLENGE_DAYS}</strong>
              {v.day === 0 && ' (la racha se cortó; su mejor tramo fue de ' + v.bestRun + ' días)'}.
            </p>
            <div className="mt-2 flex gap-1" role="img" aria-label={`Día ${v.day} de ${CHALLENGE_DAYS}`}>
              {Array.from({ length: CHALLENGE_DAYS }, (_, i) => (
                <span key={i} className={`h-3 flex-1 rounded-sm ${i < v.day ? 'bg-go-primary' : i < v.bestRun ? 'bg-go-primary/40' : 'bg-go-border'}`} />
              ))}
            </div>
            <h3 className="mt-4 flex items-center gap-1.5 text-sm font-bold"><Award size={16} aria-hidden /> Premios</h3>
            {v.prizes.length === 0 ? (
              <p className="mt-1 text-sm text-go-muted">Todavía no llegó al primer hito (día 7).</p>
            ) : (
              <ul className="mt-2 divide-y divide-go-border rounded border border-go-border">
                {v.prizes.map((p) => (
                  <li key={p.code} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm">
                    <span>{PRIZE_LABEL[p.type]} <span className="text-go-muted">· hito día {p.milestone} · {p.code}</span></span>
                    <span className={`font-bold ${p.redeemed ? 'text-go-primary' : 'text-[#6B4A00]'}`}>{p.redeemed ? '✓ Canjeado' : 'Pendiente de canje'}</span>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </Panel>
    </>
  )
}
