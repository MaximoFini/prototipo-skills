import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Volume2 } from 'lucide-react'
import { Button, ScreenHeader, Skilly } from '@/design'
import { useApp } from '@/store/useApp'
import { speak, ttsAvailable } from '@/lib/tts'
import { normalize } from '@/domain/validate'

export default function VocabularyPage() {
  const nav = useNavigate()
  const vocabulary = useApp((s) => s.vocabulary)
  const [q, setQ] = useState('')

  const list = useMemo(() => {
    const nq = normalize(q)
    return [...vocabulary]
      .sort((a, b) => a.en.localeCompare(b.en, 'en', { sensitivity: 'base' }))
      .filter((v) => !nq || normalize(v.en).includes(nq) || normalize(v.es).includes(nq))
  }, [vocabulary, q])

  return (
    <div className="flex h-full flex-col bg-white">
      <ScreenHeader title="Vocabulario" back="/practice" right={vocabulary.length > 0 ? <span className="mr-2 rounded-full bg-go-primary-tint px-3 py-1 font-display text-[14px] font-extrabold text-go-primary">{vocabulary.length}</span> : undefined} />
      {vocabulary.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
          <Skilly mood="sleepy" size={96} />
          <h2 className="font-display text-[20px] font-extrabold text-go-text">Todavía no aprendiste palabras</h2>
          <p className="text-[15px] text-go-muted">¡Hacé una lección!</p>
          <Button onClick={() => nav('/')} className="mt-2">Ir a aprender</Button>
        </div>
      ) : (
        <>
          <div className="shrink-0 px-4 pb-2 pt-3">
            <label className="flex items-center gap-2 rounded-go border-2 border-go-border bg-go-surface px-3 py-2.5 focus-within:border-go-primary">
              <Search size={20} className="text-go-muted" aria-hidden />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar en inglés o en español" aria-label="Buscar palabra" className="min-w-0 flex-1 bg-transparent text-[16px] text-go-text outline-none placeholder:text-go-muted" />
            </label>
            {!ttsAvailable() && <p className="mt-2 text-[12px] text-go-muted">Tu dispositivo no tiene voz para escuchar las palabras, pero el texto está.</p>}
          </div>
          <div className="scroll-y flex-1 px-4 pb-8">
            {list.length === 0 ? (
              <p className="py-10 text-center text-go-muted">No encontré “{q}”. ¿Probamos con otra?</p>
            ) : (
              <ul className="m-0 list-none divide-y-2 divide-go-border p-0">
                {list.map((v) => (
                  <li key={v.en} className="flex items-center gap-3 py-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-go-surface text-[24px]" aria-hidden>{v.emoji ?? 'Aa'}</span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-display text-[18px] font-extrabold text-go-text">{v.en}</div>
                      <div className="truncate text-[14px] text-go-muted">{v.es}</div>
                    </div>
                    <button type="button" onClick={() => speak(v.en)} aria-label={`Escuchar ${v.en}`} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-go-primary-tint text-go-primary active:scale-95"><Volume2 size={22} strokeWidth={2.5} /></button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  )
}
