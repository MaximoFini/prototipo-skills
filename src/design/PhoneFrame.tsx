import type { ReactNode } from 'react'

/** En mobile ocupa toda la pantalla; en desktop se muestra dentro de un marco de teléfono. */
export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-full bg-go-surface sm:flex sm:items-center sm:justify-center sm:bg-[radial-gradient(circle_at_30%_20%,#E6F2EB,#D8CFCC)] sm:p-6">
      <div className="relative mx-auto flex h-[100dvh] w-full max-w-[430px] flex-col overflow-hidden bg-white sm:h-[860px] sm:max-h-[94vh] sm:rounded-[44px] sm:border-[10px] sm:border-[#1B1B1B] sm:shadow-2xl" id="phone-root">
        {children}
      </div>
    </div>
  )
}
