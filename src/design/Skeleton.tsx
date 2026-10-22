import { Skilly } from '@/assets/Skilly'

function Bone({ className = '' }: { className?: string }) {
  return <div className={`skeleton-shimmer rounded-go bg-go-surface ${className}`} />
}

/**
 * Carga entre pantallas: esqueleto con brillo + Skilly saltando.
 * Aparece con un pequeño retraso para que en cargas rápidas no parpadee.
 */
export function PageLoading() {
  return (
    <div role="status" aria-label="Cargando" className="flex h-full animate-[fadeIn_.25s_ease-out_.15s_both] flex-col gap-3 px-4" style={{ paddingTop: 'calc(16px + var(--safe-top))' }}>
      <div className="flex items-center gap-3">
        <Bone className="h-9 w-9 !rounded-full" />
        <Bone className="h-5 flex-1" />
        <Bone className="h-9 w-9 !rounded-full" />
      </div>
      <Bone className="h-24 w-full" />
      <div className="grid flex-1 place-items-center">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-[hop_.7s_ease-in-out_infinite]"><Skilly mood="happy" size={64} /></div>
          <div className="h-2 w-10 animate-[hopShadow_.7s_ease-in-out_infinite] rounded-full bg-black/10" />
        </div>
      </div>
      <Bone className="h-16 w-full" />
      <Bone className="mb-4 h-16 w-full" />
    </div>
  )
}
