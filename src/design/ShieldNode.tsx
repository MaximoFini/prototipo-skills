import type { ReactNode } from 'react'
import { SHIELD_PATH } from '@/assets/ShieldMark'

export type NodeState = 'active' | 'done' | 'locked'
/** Nodo del mapa de lecciones con forma de escudo. */
export function ShieldNode({ state, size = 76, children, onClick, label }: { state: NodeState; size?: number; children?: ReactNode; onClick?: () => void; label?: string }) {
  const fill = state === 'done' ? '#F2C94C' : state === 'active' ? '#00522E' : '#D8CFCC'
  const edge = state === 'done' ? '#C9A02C' : state === 'active' ? '#003B20' : '#B5ABA6'
  return (
    <button type="button" onClick={onClick} aria-label={label} disabled={state === 'locked' && !onClick}
      className={`relative grid place-items-center active:translate-y-[3px] ${state === 'active' ? 'animate-float' : ''}`} style={{ width: size, height: size * 1.15 }}>
      {state === 'active' && (
        // Ondas que salen del nodo actual: "tocame".
        <>
          <span aria-hidden className="absolute inset-[-6px] animate-[ripple_2s_ease-out_infinite] rounded-full border-4 border-go-primary/40" />
          <span aria-hidden className="absolute inset-[-6px] animate-[ripple_2s_ease-out_1s_infinite] rounded-full border-4 border-go-primary/40" />
        </>
      )}
      <svg width={size} height={size * 1.15} viewBox="0 0 100 120" className="absolute inset-0" aria-hidden>
        <path d={SHIELD_PATH} fill={edge} transform="translate(0 6)" />
        <path d={SHIELD_PATH} fill={fill} stroke="#fff" strokeWidth={state === 'active' ? 5 : 0} strokeLinejoin="round" />
      </svg>
      <span className={`relative -mt-1 ${state === 'locked' ? 'text-go-muted' : state === 'done' ? 'text-go-text' : 'text-white'}`}>{children}</span>
    </button>
  )
}
