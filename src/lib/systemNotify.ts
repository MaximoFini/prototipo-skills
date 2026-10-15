// Notificaciones del sistema (Notification API + service worker). En el prototipo se disparan localmente;
// en producción las mandaría el servidor con Web Push (ver PLANIFICACION.md 3.7).
export const canNotify = () => typeof window !== 'undefined' && 'Notification' in window
export const permission = (): NotificationPermission | 'unsupported' => (canNotify() ? Notification.permission : 'unsupported')

export async function askPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!canNotify()) return 'unsupported'
  try { return await Notification.requestPermission() } catch { return Notification.permission }
}

export async function showSystemNotification(title: string, body: string): Promise<boolean> {
  if (!canNotify() || Notification.permission !== 'granted') return false
  const base = import.meta.env.BASE_URL
  const opts: NotificationOptions = { body, icon: `${base}icon-192.png`, badge: `${base}icon-192.png`, tag: 'skills-go' }
  try {
    const reg = await navigator.serviceWorker?.getRegistration()
    if (reg) await reg.showNotification(title, opts)
    else new Notification(title, opts)
    return true
  } catch {
    return false
  }
}
