import { useRef, type ReactNode } from 'react'

/** Envuelve el logo: 3 toques seguidos abren el panel de demo (window event 'skills:open-demo'). */
export function DemoTrigger({ children, className = '' }: { children: ReactNode; className?: string }) {
  const taps = useRef<number[]>([])
  const onTap = () => {
    const t = Date.now()
    taps.current = [...taps.current.filter((x) => t - x < 700), t]
    if (taps.current.length >= 3) {
      taps.current = []
      window.dispatchEvent(new Event('skills:open-demo'))
    }
  }
  return <div role="presentation" onClick={onTap} className={className}>{children}</div>
}
