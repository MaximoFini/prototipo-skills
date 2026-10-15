import type { SVGProps } from 'react'

export const SHIELD_PATH = 'M50 3 L93 19 C93 66 81 98 50 117 C19 98 7 66 7 19 Z'
export const SHIELD_INNER = 'M50 9 L87 23 C87 63 77 91 50 109 C23 91 13 63 13 23 Z'

/** Escudo de Skills (versión limpia, vectorial). `mono` lo pinta con un solo color para fondos verdes. */
export function ShieldMark({ size = 48, mono, ...rest }: { size?: number; mono?: string } & SVGProps<SVGSVGElement>) {
  const red = mono ?? '#B8252B'
  const green = mono ?? '#00522E'
  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 100 120" role="img" aria-label="Escudo Skills" {...rest}>
      <defs>
        <clipPath id="sh-clip"><path d={SHIELD_INNER} /></clipPath>
      </defs>
      <path d={SHIELD_PATH} fill={green} />
      <g clipPath="url(#sh-clip)">
        <rect x="0" y="0" width="100" height="120" fill={mono ? '#fff' : '#fff'} />
        <rect x="0" y="0" width="34" height="120" fill={red} />
        <rect x="66" y="0" width="34" height="120" fill={red} />
      </g>
      <text x="50" y="76" textAnchor="middle" fontFamily="Georgia, 'Times New Roman', serif" fontWeight="700" fontSize="74" fill={red}>S</text>
      <path d="M10 62 L38 56 Q50 52 62 56 L90 62 L84 72 L62 66 Q50 63 38 66 L16 72 Z" fill={green} stroke="#D8CFCC" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  )
}
