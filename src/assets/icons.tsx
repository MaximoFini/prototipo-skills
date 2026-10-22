import { useId } from 'react'
import type { SVGProps } from 'react'
type P = { size?: number } & SVGProps<SVGSVGElement>

/** Íconos de juego propios (sólidos, con borde). */
export function HeartIcon({ size = 24, broken, ...r }: P & { broken?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden {...r}>
      <path d="M16 28 C5 20 3 14 3 10.5 C3 6.5 6 4 9.5 4 C12.4 4 14.7 5.6 16 8 C17.3 5.6 19.6 4 22.5 4 C26 4 29 6.5 29 10.5 C29 14 27 20 16 28Z" fill={broken ? '#CFC6C1' : '#D21B20'} stroke={broken ? '#B5ABA6' : '#8E1C21'} strokeWidth="2" strokeLinejoin="round" />
      {!broken && <path d="M8 10 Q8 7.5 10.5 7.5" stroke="#fff" strokeOpacity=".7" strokeWidth="2" fill="none" strokeLinecap="round" />}
    </svg>
  )
}
export function FlameIcon({ size = 24, off, ...r }: P & { off?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden {...r}>
      <path d="M16 2 C17 8 25 11 25 20 C25 26 21 30 16 30 C11 30 7 26 7 20 C7 16 9 13 11 11 C11 14 12 15 13.5 15.5 C13 10 14 6 16 2Z" fill={off ? '#D8CFCC' : '#F2A33A'} stroke={off ? '#B5ABA6' : '#C77412'} strokeWidth="2" strokeLinejoin="round" />
      <path d="M16 15 C17.5 18 20 19 20 22.5 C20 25 18.3 26.5 16 26.5 C13.7 26.5 12 25 12 22.5 C12 20 14.5 18.5 16 15Z" fill={off ? '#EFE9E6' : '#F2C94C'} />
    </svg>
  )
}
export function BoltIcon({ size = 24, ...r }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden {...r}>
      <path d="M18 2 L6 18 H14 L12 30 L26 12 H17.5 Z" fill="#F2C94C" stroke="#C9A02C" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  )
}
export function GemIcon({ size = 24, ...r }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden {...r}>
      <path d="M9 5 H23 L29 12 L16 28 L3 12 Z" fill="#4FA3F0" stroke="#1F5FA8" strokeWidth="2" strokeLinejoin="round" />
      <path d="M3 12 H29 M12 12 L16 28 L20 12 L16 5 Z" stroke="#1F5FA8" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <path d="M9 5 L12 12 L16 5" fill="#9AD0FA" opacity=".8" />
    </svg>
  )
}
/** Cofre ilustrado: madera roja con bandas doradas, remaches y cerradura; abierto deja ver el brillo y las gemas. */
export function ChestIcon({ size = 32, open, ...r }: P & { open?: boolean }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden {...r}>
      <defs>
        <linearGradient id={`cb${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#D23A3F" /><stop offset="1" stopColor="#8E1C21" /></linearGradient>
        <linearGradient id={`cl${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#E0565A" /><stop offset="1" stopColor="#B8252B" /></linearGradient>
        <radialGradient id={`cg${id}`} cx=".5" cy=".7" r=".6"><stop offset="0" stopColor="#FFF3B0" /><stop offset="1" stopColor="#F2C94C" stopOpacity="0" /></radialGradient>
      </defs>
      {open && <ellipse cx="16" cy="12" rx="14" ry="10" fill={`url(#cg${id})`} />}
      {/* cuerpo */}
      <rect x="3" y="14" width="26" height="15" rx="2.5" fill={`url(#cb${id})`} stroke="#6E1418" strokeWidth="1.5" />
      <path d="M3.8 19 H28.2" stroke="#6E1418" strokeWidth=".8" opacity=".5" />
      <path d="M3.8 24 H28.2" stroke="#6E1418" strokeWidth=".8" opacity=".5" />
      <rect x="6" y="14" width="3" height="15" fill="#F2C94C" stroke="#C9A02C" strokeWidth=".8" />
      <rect x="23" y="14" width="3" height="15" fill="#F2C94C" stroke="#C9A02C" strokeWidth=".8" />
      {open && (
        <>
          <path d="M5 14 H27 L26 16 H6Z" fill="#3D0A0C" />
          <path d="M11 14 L13 10.5 L15 14Z" fill="#4FA3F0" stroke="#1F5FA8" strokeWidth=".6" />
          <path d="M16 14 L18.5 9.5 L21 14Z" fill="#9AD0FA" stroke="#1F5FA8" strokeWidth=".6" />
          <circle cx="14.5" cy="12.8" r="1.4" fill="#F2C94C" stroke="#C9A02C" strokeWidth=".5" />
        </>
      )}
      {/* tapa */}
      <path d={open ? 'M3 13 L5.5 3.5 H26.5 L29 13Z' : 'M3 14.5 Q3 5.5 16 5.5 Q29 5.5 29 14.5Z'} fill={`url(#cl${id})`} stroke="#6E1418" strokeWidth="1.5" strokeLinejoin="round" />
      {!open && <path d="M7 9.5 Q16 6.5 25 9.5" stroke="#fff" strokeWidth="1.2" opacity=".35" fill="none" strokeLinecap="round" />}
      <path d={open ? 'M6 13 L8 3.6 H11 L9 13Z M21 13 L23 3.6 H26 L26 13Z' : 'M6 14.5 Q6 7 9 6.4 V14.5Z M23 6.4 Q26 7 26 14.5 H23Z'} fill="#F2C94C" stroke="#C9A02C" strokeWidth=".8" />
      {/* cerradura */}
      {!open && (
        <>
          <rect x="13" y="12" width="6" height="7.5" rx="1.5" fill="#F2C94C" stroke="#A8822A" strokeWidth="1" />
          <circle cx="16" cy="15" r="1.1" fill="#5A4408" /><rect x="15.5" y="15" width="1" height="2.4" fill="#5A4408" />
        </>
      )}
      {[[7.5, 27], [24.5, 27]].map(([x, y]) => <circle key={x} cx={x} cy={y} r=".7" fill="#C9A02C" />)}
      {open && <path d="M16 3 V0.5 M8 4 L6.5 1.5 M24 4 L25.5 1.5" stroke="#F2C94C" strokeWidth="1.6" strokeLinecap="round" />}
    </svg>
  )
}
export function TrophyIcon({ size = 28, ...r }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden {...r}>
      <path d="M9 4 H23 V13 C23 18 20 21 16 21 C12 21 9 18 9 13 Z" fill="#F2C94C" stroke="#C9A02C" strokeWidth="2" strokeLinejoin="round" />
      <path d="M9 7 H4 C4 12 6 14 9 14 M23 7 H28 C28 12 26 14 23 14" stroke="#C9A02C" strokeWidth="2" fill="none" />
      <rect x="13" y="21" width="6" height="4" fill="#C9A02C" /><rect x="9" y="25" width="14" height="4" rx="1" fill="#F2C94C" stroke="#C9A02C" strokeWidth="2" />
    </svg>
  )
}
export function CheckIcon({ size = 24, ...r }: P) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...r}><path d="M4 12.5 L10 18 L20 6" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>)
}
export function CrossIcon({ size = 24, ...r }: P) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...r}><path d="M5 5 L19 19 M19 5 L5 19" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" /></svg>)
}
export function LockIcon({ size = 24, ...r }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...r}>
      <rect x="5" y="10" width="14" height="11" rx="2.5" fill="currentColor" />
      <path d="M8 10 V7.5 A4 4 0 0 1 16 7.5 V10" stroke="currentColor" strokeWidth="2.5" fill="none" />
    </svg>
  )
}
export function StarIcon({ size = 24, ...r }: P) {
  return (<svg width={size} height={size} viewBox="0 0 24 24" aria-hidden {...r}><path d="M12 2 L14.8 8.6 L22 9.3 L16.6 14 L18.2 21 L12 17.3 L5.8 21 L7.4 14 L2 9.3 L9.2 8.6Z" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>)
}
