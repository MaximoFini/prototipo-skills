import { useEffect, useState } from 'react'
import { Download, Share } from 'lucide-react'
import { ShieldMark } from '@/assets/ShieldMark'
import { Button } from './Button'

interface BIPEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const isStandalone = () =>
  window.matchMedia?.('(display-mode: standalone)').matches || (navigator as unknown as { standalone?: boolean }).standalone === true
const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent)

/** "Instalar Skills Go": usa el prompt nativo (Android/Chrome) o explica cómo en iOS. No se muestra si ya está instalada. */
export function InstallCard() {
  const [evt, setEvt] = useState<BIPEvent | null>(null)
  const [installed, setInstalled] = useState(isStandalone())

  useEffect(() => {
    const onPrompt = (e: Event) => { e.preventDefault(); setEvt(e as BIPEvent) }
    const onInstalled = () => setInstalled(true)
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => { window.removeEventListener('beforeinstallprompt', onPrompt); window.removeEventListener('appinstalled', onInstalled) }
  }, [])

  if (installed) return null
  if (!evt && !isIos()) return null

  return (
    <section aria-label="Instalar la app" className="card-go flex items-center gap-3 border-go-primary/30 bg-go-primary-tint p-3">
      <ShieldMark size={36} />
      <div className="min-w-0 flex-1">
        <p className="font-display text-[16px] font-extrabold text-go-primary">Instalá Skills Go</p>
        {evt ? (
          <p className="text-[13px] text-go-muted">Usala como una app, sin abrir el navegador.</p>
        ) : (
          <p className="text-[13px] text-go-muted">Tocá <Share size={13} className="inline -mt-0.5" aria-label="Compartir" /> y después <b>Agregar a inicio</b>.</p>
        )}
      </div>
      {evt && (
        <Button className="!px-3 !py-2" onClick={async () => { await evt.prompt(); setEvt(null) }}>
          <Download size={18} aria-hidden /> Instalar
        </Button>
      )}
    </section>
  )
}
