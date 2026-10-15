import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

export function ScreenHeader({ title, back = true, right }: { title: string; back?: boolean | string; right?: ReactNode }) {
  const nav = useNavigate()
  return (
    <header className="flex shrink-0 items-center gap-2 border-b-2 border-go-border bg-white px-3 py-3" style={{ paddingTop: 'calc(12px + var(--safe-top))' }}>
      {back ? (
        <button type="button" onClick={() => (typeof back === 'string' ? nav(back) : nav(-1))} className="grid h-10 w-10 place-items-center rounded-full text-go-muted active:bg-go-surface" aria-label="Volver"><ChevronLeft size={28} strokeWidth={3} /></button>
      ) : <span className="w-2" />}
      <h1 className="flex-1 font-display text-[20px] font-extrabold text-go-text">{title}</h1>
      {right}
    </header>
  )
}
