import { useMemo } from 'react'

const N = 21

function seedFrom(code: string): () => number {
  let h = 2166136261
  for (let i = 0; i < code.length; i++) {
    h ^= code.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  let a = h >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), a | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Código tipo QR dibujado en SVG, determinístico por código (decorativo: no es un QR real). */
export function QrGlyph({ code, size = 112, dim }: { code: string; size?: number; dim?: boolean }) {
  const cells = useMemo(() => {
    const rnd = seedFrom(code)
    const grid: boolean[][] = Array.from({ length: N }, () => Array.from({ length: N }, () => rnd() > 0.5))
    const finder = (ox: number, oy: number) => {
      for (let y = -1; y <= 7; y++)
        for (let x = -1; x <= 7; x++) {
          const gx = ox + x, gy = oy + y
          if (gx < 0 || gy < 0 || gx >= N || gy >= N) continue
          const ring = x === 0 || x === 6 || y === 0 || y === 6
          const core = x >= 2 && x <= 4 && y >= 2 && y <= 4
          grid[gy][gx] = x >= 0 && x <= 6 && y >= 0 && y <= 6 && (ring || core)
        }
    }
    finder(0, 0)
    finder(N - 7, 0)
    finder(0, N - 7)
    return grid
  }, [code])
  const fill = dim ? '#9A918D' : '#1B1B1B'
  return (
    <svg width={size} height={size} viewBox={`-1 -1 ${N + 2} ${N + 2}`} role="img" aria-label={`Código QR de ${code}`} shapeRendering="crispEdges">
      <rect x="-1" y="-1" width={N + 2} height={N + 2} fill="#fff" />
      {cells.flatMap((row, y) => row.map((on, x) => (on ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={fill} /> : null)))}
    </svg>
  )
}
