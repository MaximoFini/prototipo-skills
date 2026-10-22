export function ProgressBar({ value, color = '#00522E', height = 16, className = '', label = 'Progreso', shine, glow }: {
  value: number
  /** Color o gradiente CSS del relleno. */
  color?: string
  height?: number
  className?: string
  label?: string
  /** Brillo que recorre la barra (lección en curso). */
  shine?: boolean
  /** Halo de color alrededor del relleno (racha de aciertos). */
  glow?: string
}) {
  const pct = Math.max(0, Math.min(100, value))
  return (
    <div className={`w-full rounded-full bg-go-border ${className}`} style={{ height }} role="progressbar" aria-label={label} aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
      <div className="relative h-full overflow-hidden rounded-full transition-[width,box-shadow,background] duration-500 ease-out"
        style={{ width: `${pct}%`, background: color, boxShadow: glow && pct > 0 ? `0 0 12px 1px ${glow}` : 'none' }}>
        <div className="absolute inset-x-2 top-[3px] h-[4px] rounded-full bg-white/30" />
        {shine && pct > 0 && (
          <div aria-hidden className="absolute inset-y-0 left-0 w-1/3 animate-[barShine_2.4s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/45 to-transparent" />
        )}
      </div>
    </div>
  )
}
