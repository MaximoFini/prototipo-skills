// Definiciones de logros. Cada uno tiene 3 niveles: bronce, plata y oro.
// `metric` se evalúa en features/gamification/achievements.ts desde el UserState.

export type AchievementMetric =
  | 'lessons' | 'perfect' | 'streak' | 'xp' | 'words' | 'early' | 'night' | 'quests'
  | 'league' | 'gems' | 'correct' | 'minutes' | 'goal-days' | 'practice-days'

/** Nombre de ícono que resuelve la AchievementsPage. */
export type AchievementIcon =
  | 'flame' | 'bolt' | 'star' | 'trophy' | 'gem' | 'check' | 'book' | 'sun' | 'moon' | 'chest' | 'target' | 'clock' | 'flag'

export interface AchievementDef {
  id: string
  title: string
  /** Usa `{n}` para el objetivo del nivel que se está persiguiendo. */
  description: string
  icon: AchievementIcon
  tiers: [number, number, number]
  metric: AchievementMetric
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'lessons', title: 'Manos a la obra', description: 'Completá {n} lecciones', icon: 'flag', tiers: [1, 10, 25], metric: 'lessons' },
  { id: 'lessons-big', title: 'Imparable', description: 'Completá {n} lecciones', icon: 'check', tiers: [50, 100, 200], metric: 'lessons' },
  { id: 'streak', title: 'Racha de fuego', description: 'Llegá a {n} días de racha', icon: 'flame', tiers: [3, 7, 14], metric: 'streak' },
  { id: 'streak-long', title: 'Maratonista', description: 'Llegá a {n} días de racha', icon: 'flame', tiers: [21, 30, 60], metric: 'streak' },
  { id: 'xp', title: 'Cazador de XP', description: 'Sumá {n} XP en total', icon: 'bolt', tiers: [100, 500, 1000], metric: 'xp' },
  { id: 'xp-big', title: 'Montaña de XP', description: 'Sumá {n} XP en total', icon: 'bolt', tiers: [2000, 5000, 10000], metric: 'xp' },
  { id: 'perfect', title: 'Cero errores', description: 'Hacé {n} lecciones perfectas', icon: 'star', tiers: [1, 5, 15], metric: 'perfect' },
  { id: 'perfect-big', title: 'Perfeccionista', description: 'Hacé {n} lecciones perfectas', icon: 'star', tiers: [25, 50, 100], metric: 'perfect' },
  { id: 'words', title: 'Vocabulario en marcha', description: 'Aprendé {n} palabras', icon: 'book', tiers: [10, 50, 150], metric: 'words' },
  { id: 'words-big', title: 'Diccionario andante', description: 'Aprendé {n} palabras', icon: 'book', tiers: [250, 400, 600], metric: 'words' },
  { id: 'early', title: 'Madrugador', description: 'Practicá {n} veces antes de las 8 de la mañana', icon: 'sun', tiers: [1, 5, 15], metric: 'early' },
  { id: 'night', title: 'Noctámbulo', description: 'Practicá {n} veces después de las 22', icon: 'moon', tiers: [1, 5, 15], metric: 'night' },
  { id: 'quests', title: 'Misionero', description: 'Completá {n} misiones', icon: 'chest', tiers: [1, 10, 30], metric: 'quests' },
  { id: 'league', title: 'Liga de oro', description: 'Subí de liga: Plata, Oro y Rubí', icon: 'trophy', tiers: [1, 2, 4], metric: 'league' },
  { id: 'gems', title: 'Tesoro escondido', description: 'Juntá {n} gemas', icon: 'gem', tiers: [100, 500, 1000], metric: 'gems' },
  { id: 'correct', title: 'Buen ojo', description: 'Respondé bien {n} ejercicios', icon: 'target', tiers: [50, 250, 1000], metric: 'correct' },
  { id: 'minutes', title: 'Dedicación', description: 'Practicá {n} minutos en total', icon: 'clock', tiers: [10, 60, 180], metric: 'minutes' },
  { id: 'goal-days', title: 'Meta cumplida', description: 'Cumplí tu meta diaria {n} días', icon: 'target', tiers: [1, 7, 21], metric: 'goal-days' },
  { id: 'practice-days', title: 'Constante', description: 'Practicá {n} días distintos', icon: 'flame', tiers: [5, 15, 30], metric: 'practice-days' },
]

export const MEDALS = ['', 'Bronce', 'Plata', 'Oro'] as const
