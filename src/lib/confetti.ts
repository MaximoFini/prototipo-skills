import confetti from 'canvas-confetti'
const COLORS = ['#00522E', '#B8252B', '#F2C94C', '#FFFFFF', '#D8CFCC']
const reduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
export function burst() {
  if (reduced()) return
  confetti({ particleCount: 90, spread: 80, origin: { y: 0.65 }, colors: COLORS })
}
export function celebrate() {
  if (reduced()) return
  const end = Date.now() + 900
  ;(function frame() {
    confetti({ particleCount: 5, angle: 60, spread: 60, origin: { x: 0, y: 0.8 }, colors: COLORS })
    confetti({ particleCount: 5, angle: 120, spread: 60, origin: { x: 1, y: 0.8 }, colors: COLORS })
    if (Date.now() < end) requestAnimationFrame(frame)
  })()
}
