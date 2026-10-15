// =====================================================================
// CONTRATO DE DATOS COMPARTIDO — Skills Go
// Todos los módulos importan tipos desde acá. Si falta algo, se agrega
// acá (no se redefine en cada feature).
// =====================================================================

export type LevelId = 'A1' | 'A2' | 'B1'
export type Lang = 'en' | 'es'

// ---------- Ejercicios ----------
export type ExerciseType =
  | 'choose-translation'
  | 'build-sentence'
  | 'type-translation'
  | 'match-pairs'
  | 'listen-type'
  | 'listen-choose'
  | 'fill-blank'
  | 'choose-image'
  | 'speak'

interface ExerciseBase {
  id: string
  /** Explicación breve en español (voseo) que se muestra en el panel de feedback. */
  explanation?: string
  /** Palabras nuevas que enseña el ejercicio (alimentan el vocabulario). */
  vocab?: VocabItem[]
}

export interface VocabItem {
  en: string
  es: string
  emoji?: string
}

/** Frase en `promptLang`; el alumno elige la traducción. */
export interface ChooseTranslation extends ExerciseBase {
  type: 'choose-translation'
  prompt: string
  promptLang: Lang
  options: string[]
  correct: number
}

/** Armar la oración tocando palabras. `accepted` = variantes válidas (cada una es la oración completa). */
export interface BuildSentence extends ExerciseBase {
  type: 'build-sentence'
  prompt: string
  promptLang: Lang
  /** La oración se arma en el idioma contrario a `promptLang`. */
  accepted: string[]
  /** Banco de palabras (incluye las necesarias + distractores). */
  bank: string[]
}

/** Escribir la traducción. */
export interface TypeTranslation extends ExerciseBase {
  type: 'type-translation'
  prompt: string
  promptLang: Lang
  accepted: string[]
}

export interface MatchPairs extends ExerciseBase {
  type: 'match-pairs'
  pairs: { en: string; es: string }[] // 4 o 5 pares
}

/** Se reproduce `audio` (inglés) y el alumno lo escribe en inglés. */
export interface ListenType extends ExerciseBase {
  type: 'listen-type'
  audio: string
  accepted: string[]
  /** Traducción al español para mostrar en el feedback. */
  translation?: string
}

export interface ListenChoose extends ExerciseBase {
  type: 'listen-choose'
  audio: string
  options: string[]
  correct: number
}

/** `sentence` contiene `___` donde va el hueco. */
export interface FillBlank extends ExerciseBase {
  type: 'fill-blank'
  sentence: string
  options: string[]
  correct: number
  translation?: string
}

export interface ChooseImage extends ExerciseBase {
  type: 'choose-image'
  word: string
  options: { emoji: string; label: string }[]
  correct: number
}

/** Mock: simula reconocimiento de voz. Siempre se puede omitir. */
export interface Speak extends ExerciseBase {
  type: 'speak'
  phrase: string
  translation: string
}

export type Exercise =
  | ChooseTranslation
  | BuildSentence
  | TypeTranslation
  | MatchPairs
  | ListenType
  | ListenChoose
  | FillBlank
  | ChooseImage
  | Speak

// ---------- Contenido ----------
export interface Lesson {
  id: string // ej: 'a1-u1-l1'
  title: string
  exercises: Exercise[]
}

export interface Unit {
  id: string // ej: 'a1-u1'
  level: LevelId
  number: number
  title: string // "Hello!"
  description: string // "Saludá y presentate"
  lessons: Lesson[]
  /** Si true, la unidad se muestra pero nunca se desbloquea en el prototipo. */
  comingSoon?: boolean
}

export interface Level {
  id: LevelId
  name: string // "A1 Starter"
  units: Unit[]
}

// ---------- Resultados ----------
export interface RunnerResult {
  correct: number
  total: number
  mistakes: Exercise[]
  seconds: number
  perfect: boolean
  heartsLost: number
  /** false si se cortó por quedarse sin corazones o por salir. */
  completed: boolean
}

export interface LessonSummary {
  lessonId: string
  xpGained: number
  gemsGained: number
  accuracy: number // 0..100
  seconds: number
  perfect: boolean
  fast: boolean
  /** true si esta lección extendió la racha hoy (primera del día). */
  streakExtended: boolean
  streak: number
  goalReached: boolean
  firstTime: boolean
}

// ---------- Estado del usuario ----------
export type DailyGoal = 10 | 20 | 30 | 50

export interface Profile {
  name: string
  avatar: string // id de avatar: 'a1'..'a8' (ver design/Avatar)
  level: LevelId
  onboarded: boolean
  createdAt: number
  commission: string // ej: "Teens 2B"
}

export interface Settings {
  dailyGoal: DailyGoal
  sound: boolean
  notifications: boolean
  reminderTime: string // "19:00"
  reminderDays: number[] // 0..6
}

export interface StreakState {
  count: number
  best: number
  lastDay: string | null // YYYY-MM-DD de la última actividad
  freezes: number
  /** Días con práctica (YYYY-MM-DD), para el calendario. */
  days: string[]
  /** Días cubiertos por un congelador. */
  frozenDays: string[]
}

export interface MistakeEntry {
  key: string // lessonId + exerciseId
  lessonId: string
  exercise: Exercise
  at: number
}

export interface LessonProgress {
  count: number
  bestAccuracy: number
  lastAt: number
}

export type QuestKind = 'xp' | 'lessons' | 'perfect' | 'streak-days' | 'accuracy'
export interface QuestState {
  id: string
  kind: QuestKind
  title: string
  target: number
  progress: number
  rewardGems: number
  claimed: boolean
}

export interface QuestsState {
  day: string
  daily: QuestState[]
  monthly: QuestState | null
}

export interface AchievementState {
  /** nivel alcanzado: 0 = sin desbloquear, 1 bronce, 2 plata, 3 oro */
  level: number
  unlockedAt: number | null
}

export interface LeagueEntry {
  id: string
  name: string
  avatar: string
  xp: number
  isUser: boolean
}

export interface LeagueState {
  tier: number // 0 Bronce .. 4 Rubí
  weekStart: string // YYYY-MM-DD (lunes)
  weekXp: number
  standings: LeagueEntry[]
  lastResult: null | { from: number; to: number; rank: number; outcome: 'promoted' | 'demoted' | 'stayed' }
}

export interface OwnedReward {
  rewardId: string
  code: string
  claimedAt: number
  redeemed: boolean
}

export interface VacationState {
  joined: boolean
  startDay: string | null
  ownedRewards: OwnedReward[]
}

export interface AppNotification {
  id: string
  kind: 'streak-risk' | 'league' | 'vacation' | 'friend' | 'generic'
  title: string
  body: string
  at: number
}

export interface UserStats {
  lessonsCompleted: number
  perfectLessons: number
  correct: number
  total: number
  seconds: number
}

export interface UserState {
  profile: Profile
  settings: Settings
  hearts: number
  /** ms (reloj de la app) desde el que se cuenta la regeneración del próximo corazón. */
  heartsAnchor: number
  gems: number
  xp: number
  xpByDay: Record<string, number>
  streak: StreakState
  completed: Record<string, LessonProgress>
  mistakes: MistakeEntry[]
  vocabulary: VocabItem[]
  quests: QuestsState
  achievements: Record<string, AchievementState>
  league: LeagueState
  vacation: VacationState
  friends: string[]
  doubleXpUntil: number
  stats: UserStats
  notifications: AppNotification[]
  /** ms que se suman al reloj real (panel de demo: "pasar días"). */
  clockOffset: number
}
