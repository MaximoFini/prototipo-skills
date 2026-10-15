import { useMemo } from 'react'
import { Check, UserPlus } from 'lucide-react'
import { Avatar, FlameIcon, BoltIcon, ScreenHeader } from '@/design'
import { useApp } from '@/store/useApp'
import { friendsData, type Friend } from '@/data/friends'
import { sfx } from '@/lib/sfx'

export default function FriendsPage() {
  const following = useApp((s) => s.friends)
  const patch = useApp((s) => s.patch)

  const toggle = (id: string) => {
    sfx.tap()
    patch((s) => ({ friends: s.friends.includes(id) ? s.friends.filter((x) => x !== id) : [...s.friends, id] }))
  }

  const sorted = useMemo(
    () => [...friendsData].sort((a, b) => Number(following.includes(b.id)) - Number(following.includes(a.id)) || b.streak - a.streak),
    [following],
  )
  const top = useMemo(() => [...friendsData].sort((a, b) => b.streak - a.streak)[0], [])

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="Amigos" back="/profile" />
      <div className="scroll-y flex-1 space-y-4 px-4 py-4">
        {top && (
          <section className="rounded-go border-2 border-go-streak bg-[#FFF6E6] p-4" aria-label="Amigo de racha">
            <p className="font-display text-[12px] font-extrabold uppercase tracking-[0.08em] text-go-muted">Amigo de racha</p>
            <div className="mt-2 flex items-center gap-3">
              <Avatar id={top.avatar} name={top.name} size={52} />
              <div className="min-w-0 flex-1">
                <p className="font-display text-[18px] font-extrabold leading-tight text-go-text">{top.name} lleva {top.streak} días. ¿Lo alcanzás?</p>
                <p className="mt-0.5 flex items-center gap-1 text-[13px] font-bold text-go-streak"><FlameIcon size={18} />{top.streak} días seguidos</p>
              </div>
            </div>
            {!following.includes(top.id) && (
              <button type="button" onClick={() => toggle(top.id)} className="btn-3d mt-3 w-full border-go-primary-dark bg-go-primary text-white">
                <UserPlus size={18} strokeWidth={3} /> Seguir a {top.name}
              </button>
            )}
          </section>
        )}

        <section aria-label="Compañeros de la academia">
          <h2 className="mb-2 font-display text-[18px] font-extrabold text-go-text">Tus compañeros</h2>
          <ul className="space-y-2">
            {sorted.map((f) => (
              <Row key={f.id} f={f} followed={following.includes(f.id)} onToggle={() => toggle(f.id)} />
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}

function Row({ f, followed, onToggle }: { f: Friend; followed: boolean; onToggle: () => void }) {
  return (
    <li className="card-go flex items-center gap-3 p-3">
      <Avatar id={f.avatar} name={f.name} size={44} />
      <div className="min-w-0 flex-1">
        <p className="flex items-baseline gap-2"><span className="truncate font-display text-[16px] font-extrabold text-go-text">{f.name}</span><span className="shrink-0 text-[12px] font-medium text-go-muted">{f.commission}</span></p>
        <p className="flex items-center gap-3 whitespace-nowrap text-[13px] font-bold">
          <span className="flex items-center gap-0.5 text-go-streak"><FlameIcon size={16} />{f.streak}</span>
          <span className="flex items-center gap-0.5 text-go-xp-dark"><BoltIcon size={16} />{f.weekXp} XP</span>
        </p>
      </div>
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={followed}
        aria-label={`${followed ? 'Dejar de seguir a' : 'Seguir a'} ${f.name}`}
        className={`inline-flex min-h-[44px] items-center gap-1 rounded-go border-2 border-b-4 px-3 font-display text-[13px] font-extrabold uppercase tracking-wide active:translate-y-[2px] ${followed ? 'border-go-border bg-white text-go-muted' : 'border-go-primary-dark bg-go-primary text-white'}`}
      >
        {followed ? <><Check size={16} strokeWidth={3} />Siguiendo</> : 'Seguir'}
      </button>
    </li>
  )
}
