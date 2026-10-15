import { registerLeague } from '@/features/league/register'
import { registerVacation } from '@/features/vacation/register'

/**
 * CONTRATO (subagente C1). Se llama una vez desde main.tsx. Acá se inicializan y suscriben (con `on` de
 * '@/domain/events') misiones y logros, y se invocan `registerLeague()` y `registerVacation()` (C2).
 * Reacciona a 'lesson-finished', 'xp-gained', 'day-changed', 'streak-changed'.
 */
export function registerGamification() {
  registerLeague()
  registerVacation()
}
