import { on } from '@/domain/events'
import { today } from '@/domain/clock'
import { useApp } from '@/store/useApp'
import { MILESTONE_DAYS } from '@/data/rewards'
import { notifTexts } from '@/features/demo/notifTexts'
import { challengeProgress } from './vacationLogic'

const KEY = 'skills-go-vacation-notified'
const memo = new Set<string>()

function wasNotified(id: string): boolean {
  if (memo.has(id)) return true
  try {
    return (JSON.parse(localStorage.getItem(KEY) ?? '[]') as string[]).includes(id)
  } catch {
    return false
  }
}
function markNotified(id: string) {
  memo.add(id)
  try {
    const list = JSON.parse(localStorage.getItem(KEY) ?? '[]') as string[]
    localStorage.setItem(KEY, JSON.stringify([...list, id].slice(-40)))
  } catch { /* sin storage */ }
}

/** Avisa los hitos 7/14/21 del Desafío de Vacaciones (una sola vez por hito y por inicio). */
export function checkVacationMilestones() {
  const { vacation, streak, pushNotification } = useApp.getState()
  if (!vacation.joined || !vacation.startDay) return
  const progress = challengeProgress(streak.days, vacation.startDay, today())
  for (const day of MILESTONE_DAYS) {
    if (progress < day) continue
    const id = `${vacation.startDay}:${day}`
    if (wasNotified(id)) continue
    markNotified(id)
    // Solo avisamos el hito exacto de hoy; los viejos (p. ej. perfil demo) se marcan sin molestar.
    if (progress === day) pushNotification(notifTexts.vacationMilestone(day))
  }
}

let registered = false
export function registerVacation() {
  if (registered) return
  registered = true
  on('streak-changed', () => checkVacationMilestones())
}
