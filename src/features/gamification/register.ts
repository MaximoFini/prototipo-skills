import { registerLeague } from '@/features/league/register'
import { registerVacation } from '@/features/vacation/register'
import { on } from '@/domain/events'
import { now } from '@/domain/clock'
import { useApp } from '@/store/useApp'
import { applyQuestEvent, completedCount, type QuestEvent } from './quests'
import { ensureTodayQuests } from './questActions'
import { bumpCounter, checkAchievements } from './achievementActions'

let registered = false

function applyToQuests(ev: QuestEvent) {
  ensureTodayQuests()
  const s = useApp.getState()
  const quests = applyQuestEvent(s.quests, ev)
  const before = completedCount(s.quests)
  const after = completedCount(quests)
  s.patch({ quests })
  if (after > before) bumpCounter('quests', after - before)
}

/**
 * Se llama una vez desde main.tsx. Inicializa misiones y logros, y se suscribe a los eventos del dominio.
 * Idempotente (StrictMode / HMR). También registra liga y vacaciones (C2).
 */
export function registerGamification() {
  if (registered) return
  registered = true

  registerLeague()
  registerVacation()

  // Misiones del día/mes al arrancar.
  ensureTodayQuests()
  checkAchievements()

  on('xp-gained', ({ amount }) => {
    if (amount > 0) applyToQuests({ type: 'xp', amount })
    checkAchievements()
  })
  on('lesson-finished', ({ summary }) => {
    applyToQuests({ type: 'lesson', perfect: summary.perfect, accuracy: summary.accuracy })
    const hour = new Date(now()).getHours()
    if (hour < 8) bumpCounter('early')
    if (hour >= 22) bumpCounter('night')
    checkAchievements()
  })
  on('day-changed', () => {
    ensureTodayQuests()
    checkAchievements()
  })
  on('streak-changed', () => checkAchievements())
  on('heart-lost', () => checkAchievements())

  // Otros módulos (liga, vacaciones, demo) cambian el estado vía patch: re-evaluamos logros sin acoplarnos.
  let lastKey = ''
  useApp.subscribe((s) => {
    const key = [s.stats.lessonsCompleted, s.stats.perfectLessons, s.xp, s.gems, s.league.tier, s.streak.best, s.streak.count, s.vocabulary.length, s.stats.correct, s.streak.days.length].join('|')
    if (key === lastKey) return
    lastKey = key
    checkAchievements()
  })
}
