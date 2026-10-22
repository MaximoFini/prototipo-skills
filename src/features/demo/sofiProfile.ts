import { useApp } from '@/store/useApp'
import { HOUR, addDays, now, today } from '@/domain/clock'
import { HEARTS_MAX } from '@/domain/rules'
import { allLessons } from '@/data/content'
import type { UserState, VocabItem } from '@/domain/types'
import { evaluateAchievements } from '@/features/gamification/achievements'
import { rank } from '@/features/league/leagueLogic'

/**
 * Estado "Alumno con 12 días de racha" (Sofi). La racha llega hasta ayer y hoy
 * todavía no practicó: así la primera lección de la demo extiende la racha y
 * completa la meta diaria (los dos festejos grandes).
 */
function sofiProfile(): Partial<UserState> {
  const t = today()
  const days = Array.from({ length: 12 }, (_, i) => addDays(t, -12 + i))
  const completed: UserState['completed'] = {}
  allLessons.slice(0, 6).forEach((l, i) => {
    completed[l.id] = { count: 1 + (i % 2), bestAccuracy: 80 + ((i * 7) % 21), lastAt: now() - (6 - i) * 24 * HOUR }
  })
  const vocab = new Map<string, VocabItem>()
  for (const l of allLessons.slice(0, 6)) for (const ex of l.exercises) for (const v of ex.vocab ?? []) vocab.set(v.en.toLowerCase(), v)
  const xpByDay: Record<string, number> = {}
  const per = [60, 85, 70, 55, 90, 75, 40, 80, 65, 70, 100, 50]
  days.forEach((d, i) => { xpByDay[d] = per[i] })
  return {
    profile: { name: 'Sofi', avatar: 'a3', level: 'A1', onboarded: true, createdAt: now() - 40 * 24 * HOUR, commission: 'Teens 2B' },
    xp: 840,
    gems: 420,
    hearts: HEARTS_MAX,
    heartsAnchor: now(),
    xpByDay,
    streak: { count: 12, best: 12, lastDay: addDays(t, -1), freezes: 1, days, frozenDays: [] },
    completed,
    vocabulary: [...vocab.values()],
    vacation: { joined: true, startDay: addDays(t, -12), ownedRewards: [] },
    stats: { lessonsCompleted: 8, perfectLessons: 3, correct: 62, total: 70, seconds: 1900 },
  }
}

/** Deja la liga con Sofi 2.ª, a pocos XP del 1.º: una lección y pasa a la cabeza. */
function placeInLeague() {
  const { league, patch } = useApp.getState()
  const bots = rank(league.standings).filter((e) => !e.isUser)
  if (!bots.length) return
  const weekXp = Math.max(30, bots[0].xp - 8)
  patch({ league: { ...league, weekXp, standings: league.standings.map((e) => (e.isUser ? { ...e, xp: weekXp } : e)) } })
}

/** Resetea y carga el perfil demo completo (racha, logros, vocabulario, liga). */
export function loadSofiDemo() {
  const A = () => useApp.getState()
  A().reset()
  A().patch(sofiProfile())
  // Logros ya ganados "de antes": se cargan antes de refresh para que no salten avisos al entrar.
  A().patch((s) => ({ achievements: evaluateAchievements(s, now() - 2 * 24 * HOUR).achievements }))
  allLessons.slice(5, 6).forEach((l) => A().recordMistakes(l.id, l.exercises.slice(0, 3)))
  A().refresh()
  placeInLeague()
  A().patch({ notifications: [] })
}
