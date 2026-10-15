import { addDays, today } from '@/domain/clock'

const SCALE = ['#EFEAE7', '#B5D5C3', '#6AA586', '#2E7D55', '#00522E']
const DOW = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
const CELL = 18, GAP = 4

/** Calendario de actividad (lunes a domingo, una columna por semana). */
export function Heatmap({ history }: { history: number[] }) {
  const ref = today()
  const days = history.map((n, i) => {
    const date = addDays(ref, -(history.length - 1 - i))
    const [y, m, d] = date.split('-').map(Number)
    return { n, date, dow: (new Date(y, m - 1, d, 12).getDay() + 6) % 7 }
  })
  const lead = days[0].dow
  const cols = Math.ceil((lead + days.length) / 7)
  const left = 22, top = 18
  const w = left + cols * (CELL + GAP), h = top + 7 * (CELL + GAP)
  const active = history.filter((n) => n > 0).length
  return (
    <figure>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{ maxWidth: w * 2 }} role="img" aria-label={`Actividad de los últimos ${history.length} días: ${active} días con práctica`}>
        {DOW.map((l, i) => <text key={l} x={0} y={top + i * (CELL + GAP) + 13} fontSize="11" fill="#4A4441">{l}</text>)}
        {days.map((d, i) => {
          const idx = lead + i
          const c = Math.floor(idx / 7), r = idx % 7
          const lvl = Math.min(4, d.n === 0 ? 0 : d.n + 1)
          const [, mm, dd] = d.date.split('-')
          return (
            <g key={d.date}>
              <rect x={left + c * (CELL + GAP)} y={top + r * (CELL + GAP)} width={CELL} height={CELL} rx={3} fill={SCALE[lvl]} stroke={lvl === 0 ? '#CFC6C1' : 'none'}>
                <title>{`${Number(dd)}/${Number(mm)}: ${d.n === 0 ? 'sin práctica' : `${d.n} ${d.n === 1 ? 'lección' : 'lecciones'}`}`}</title>
              </rect>
              {(d.dow === 0 && (i === 0 || Number(dd) <= 7)) && <text x={left + c * (CELL + GAP)} y={11} fontSize="11" fill="#4A4441">{Number(dd)}/{Number(mm)}</text>}
            </g>
          )
        })}
      </svg>
      <figcaption className="mt-2 flex items-center gap-2 text-xs text-go-muted">
        Menos {SCALE.map((c, i) => <span key={c} className="inline-block h-3.5 w-3.5 rounded-sm border border-go-border-dark" style={{ background: c }} title={i === 0 ? '0 lecciones' : `${i === 4 ? '3+' : i} lecciones`} aria-hidden />)} Más
        <span className="ml-2">Cada cuadrado es un día; el color indica cuántas lecciones hizo.</span>
      </figcaption>
    </figure>
  )
}
