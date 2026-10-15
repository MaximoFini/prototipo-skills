export function ProgressBar({ value, color = '#00522E', height = 16, className = '', label = 'Progreso' }: { value: number; color?: string; height?: number; className?: string; label?: string }) {
  const pct = Math.max(0, Math.min(100, value))
  return (
    <div className={`w-full overflow-hidden rounded-full bg-go-border ${className}`} style={{ height }} role="progressbar" aria-label={label} aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
      <div className="relative h-full rounded-full transition-[width] duration-500 ease-out" style={{ width: `${pct}%`, background: color }}>
        <div className="absolute inset-x-2 top-[3px] h-[4px] rounded-full bg-white/30" />
      </div>
    </div>
  )
}
