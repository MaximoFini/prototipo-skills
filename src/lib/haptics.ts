// Vibración corta en celulares que la soportan (Android/Chrome; iOS Safari la ignora).
type Pattern = 'tap' | 'success' | 'error' | 'celebrate'

const PATTERNS: Record<Pattern, number | number[]> = {
  tap: 8,
  success: 18,
  error: [30, 60, 40],
  celebrate: [20, 40, 20, 40, 60],
}

const reduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

export function haptic(p: Pattern) {
  try {
    if (!reduced() && 'vibrate' in navigator) navigator.vibrate(PATTERNS[p])
  } catch { /* sin soporte */ }
}
