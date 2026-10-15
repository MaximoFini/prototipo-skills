import { ShieldMark } from './ShieldMark'

/** Lockup Skills Go: SKILLS (serif verde) + banda roja "GO" (calca la banda "ENGLISH INSTITUTE"). */
export function Lockup({ height = 56, inverse }: { height?: number; inverse?: boolean }) {
  const fs = height * 0.62
  return (
    <div className="inline-flex items-center gap-2" style={{ height }} aria-label="Skills Go">
      <ShieldMark size={height * 0.8} mono={inverse ? '#fff' : undefined} />
      <div className="flex flex-col items-stretch leading-none">
        <span style={{ fontFamily: "Georgia,'Times New Roman',serif", fontWeight: 900, fontSize: fs, letterSpacing: '-0.02em', color: inverse ? '#fff' : '#00522E' }}>SKILLS</span>
        <span className="mt-1 text-center font-sans font-bold text-white" style={{ background: '#B8252B', fontSize: fs * 0.34, letterSpacing: '.18em', padding: '2px 0' }}>GO</span>
      </div>
    </div>
  )
}
