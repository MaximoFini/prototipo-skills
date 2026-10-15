import { SHIELD_INNER, SHIELD_PATH } from './ShieldMark'

export type SkillyMood = 'happy' | 'cheer' | 'sad' | 'sleepy' | 'think' | 'wink'

/** Skilly: la mascota de Skills Go (el escudo con cara). */
export function Skilly({ mood = 'happy', size = 120, className = '' }: { mood?: SkillyMood; size?: number; className?: string }) {
  const eyeY = 52
  const Eye = ({ x, closed, big }: { x: number; closed?: boolean; big?: boolean }) =>
    closed ? (
      <path d={`M${x - 7} ${eyeY} Q${x} ${eyeY + 7} ${x + 7} ${eyeY}`} stroke="#1B1B1B" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    ) : (
      <g>
        <ellipse cx={x} cy={eyeY} rx={big ? 10 : 9} ry={big ? 12 : 11} fill="#fff" stroke="#1B1B1B" strokeWidth="2" />
        <circle cx={x + (mood === 'think' ? 3 : 0)} cy={eyeY + (mood === 'sad' ? 3 : mood === 'think' ? -3 : 1)} r="5" fill="#1B1B1B" />
        <circle cx={x + 1.5} cy={eyeY - 2} r="1.8" fill="#fff" />
      </g>
    )
  const mouth = {
    happy: <path d="M38 74 Q50 88 62 74 Z" fill="#7A1218" stroke="#1B1B1B" strokeWidth="2.5" strokeLinejoin="round" />,
    cheer: <path d="M34 72 Q50 98 66 72 Z" fill="#7A1218" stroke="#1B1B1B" strokeWidth="2.5" strokeLinejoin="round" />,
    sad: <path d="M40 82 Q50 72 60 82" stroke="#1B1B1B" strokeWidth="3.5" fill="none" strokeLinecap="round" />,
    sleepy: <ellipse cx="50" cy="78" rx="5" ry="4" fill="#7A1218" stroke="#1B1B1B" strokeWidth="2" />,
    think: <path d="M42 79 L58 77" stroke="#1B1B1B" strokeWidth="3.5" strokeLinecap="round" />,
    wink: <path d="M38 74 Q50 88 62 74 Z" fill="#7A1218" stroke="#1B1B1B" strokeWidth="2.5" strokeLinejoin="round" />,
  }[mood]
  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 100 120" className={className} role="img" aria-label={`Skilly (${mood})`}>
      <defs><clipPath id={`sk-${mood}`}><path d={SHIELD_INNER} /></clipPath></defs>
      <ellipse cx="50" cy="118" rx="26" ry="3" fill="#000" opacity=".12" />
      <path d={SHIELD_PATH} fill="#00522E" />
      <g clipPath={`url(#sk-${mood})`}>
        <rect width="100" height="120" fill="#B8252B" />
        <rect x="30" width="40" height="120" fill="#fff" />
      </g>
      <Eye x={39} closed={mood === 'sleepy'} big={mood === 'cheer'} />
      <Eye x={61} closed={mood === 'sleepy' || mood === 'wink'} big={mood === 'cheer'} />
      {mouth}
      {mood === 'sad' && <path d="M72 62 Q75 70 72 74 Q69 70 72 62Z" fill="#6EC1F2" />}
      {mood === 'cheer' && (
        <g fill="#F2C94C"><circle cx="12" cy="14" r="3" /><circle cx="90" cy="10" r="2.5" /><circle cx="96" cy="40" r="2" /><circle cx="4" cy="44" r="2" /></g>
      )}
      {mood === 'sleepy' && <text x="74" y="30" fontFamily="Gabarito, sans-serif" fontWeight="800" fontSize="14" fill="#00522E">z</text>}
      <path d="M12 94 L38 86 Q50 83 62 86 L88 94 L82 103 L62 97 Q50 94 38 97 L18 103 Z" fill="#00522E" stroke="#D8CFCC" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  )
}
