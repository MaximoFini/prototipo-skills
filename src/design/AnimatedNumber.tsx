import { useEffect, useRef, useState } from 'react'
import { animate, motion, useReducedMotion } from 'framer-motion'

/**
 * Número que "cuenta" hasta el valor nuevo y hace un pequeño salto cuando sube
 * (XP, gemas, racha). Sin movimiento si el sistema pide menos animaciones.
 */
export function AnimatedNumber({ value, duration = 0.8, className = '' }: { value: number; duration?: number; className?: string }) {
  const reduce = useReducedMotion()
  const [shown, setShown] = useState(value)
  const [bump, setBump] = useState(0)
  const prev = useRef(value)

  useEffect(() => {
    const from = prev.current
    prev.current = value
    if (from === value) return
    if (reduce) { setShown(value); return }
    if (value > from) setBump((n) => n + 1)
    const ctrl = animate(from, value, { duration, ease: 'easeOut', onUpdate: (v) => setShown(Math.round(v)) })
    return () => ctrl.stop()
  }, [value, duration, reduce])

  return (
    <motion.span key={bump} className={`inline-block tabular-nums ${className}`}
      initial={bump && !reduce ? { scale: 1.35 } : false} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 380, damping: 14 }}>
      {shown}
    </motion.span>
  )
}
