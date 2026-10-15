import { useApp } from '@/store/useApp'
import { today } from '@/domain/clock'
import { claimQuestIn, ensureQuests } from './quests'
import { checkAchievements } from './achievementActions'
import { sfx } from '@/lib/sfx'
import { burst } from '@/lib/confetti'

/** Asegura que las misiones correspondan al día/mes actuales (idempotente). */
export function ensureTodayQuests() {
  const s = useApp.getState()
  const next = ensureQuests(s.quests, today(), s.xpByDay)
  if (next !== s.quests) s.patch({ quests: next })
}

/** Reclama el cofre de una misión: suma gemas, sonido y confeti. Devuelve las gemas ganadas. */
export function claimQuest(id: string): number {
  const s = useApp.getState()
  const { quests, gems } = claimQuestIn(s.quests, id)
  if (!gems) return 0
  s.patch({ quests })
  s.addGems(gems)
  sfx.gem()
  burst()
  checkAchievements()
  return gems
}
