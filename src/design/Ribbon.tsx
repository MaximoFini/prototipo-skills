import type { ReactNode } from 'react'

/** La cinta verde del escudo, usada como cabecera de unidad / separador. */
export function Ribbon({ children, sub, tone = 'green' }: { children: ReactNode; sub?: ReactNode; tone?: 'green' | 'red' | 'locked' }) {
  const bg = tone === 'green' ? '#00522E' : tone === 'red' ? '#B8252B' : '#B5ABA6'
  return (
    <div className="relative mx-4 my-2">
      <div className="px-5 py-3 text-white" style={{ background: bg, clipPath: 'polygon(0 0,100% 0,calc(100% - 14px) 50%,100% 100%,0 100%,14px 50%)', borderBottom: '4px solid rgba(0,0,0,.25)' }}>
        <div className="px-3 text-center">
          <div className="font-display text-[17px] font-extrabold leading-tight">{children}</div>
          {sub && <div className="text-[13px] font-medium opacity-90">{sub}</div>}
        </div>
      </div>
    </div>
  )
}
