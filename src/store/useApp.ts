import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DailyGoal, LessonSummary, LevelId, MistakeEntry, RunnerResult, UserState, Exercise, AppNotification } from '@/domain/types'
import { DAY, dayKey, now, setClockOffset, today, weekStart } from '@/domain/clock'
import {
  DOUBLE_XP_COST, DOUBLE_XP_MS, FAST_SECONDS_PER_EXERCISE, FREEZE_COST, HEARTS_MAX, REFILL_COST,
  applyActivity, lessonGems, lessonXp, loseHeart as ruleLoseHeart, regenHearts, resolveStreak,
} from '@/domain/rules'
import { emit } from '@/domain/events'
import { getLesson } from '@/data/content'

export function initialState(): UserState {
  const t = now()
  return {
    profile: { name: '', avatar: 'a1', level: 'A1', onboarded: false, createdAt: t, commission: 'Teens 2B' },
    settings: { dailyGoal: 20, sound: true, notifications: true, reminderTime: '19:00', reminderDays: [0, 1, 2, 3, 4, 5, 6] },
    hearts: HEARTS_MAX,
    heartsAnchor: t,
    gems: 50,
    xp: 0,
    xpByDay: {},
    streak: { count: 0, best: 0, lastDay: null, freezes: 0, days: [], frozenDays: [] },
    completed: {},
    mistakes: [],
    vocabulary: [],
    quests: { day: '', daily: [], monthly: null },
    achievements: {},
    league: { tier: 0, weekStart: weekStart(today()), weekXp: 0, standings: [], lastResult: null },
    vacation: { joined: false, startDay: null, ownedRewards: [] },
    friends: ['f1', 'f2'],
    doubleXpUntil: 0,
    stats: { lessonsCompleted: 0, perfectLessons: 0, correct: 0, total: 0, seconds: 0 },
    notifications: [],
    clockOffset: 0,
  }
}

interface Actions {
  completeOnboarding(p: { name: string; avatar: string; level: LevelId; dailyGoal: DailyGoal }): void
  setSettings(patch: Partial<UserState['settings']>): void
  setProfile(patch: Partial<UserState['profile']>): void
  /** Aplica regeneración de corazones y cortes de racha. Llamar al abrir la app, al volver a foco y cada minuto. */
  refresh(): void
  loseHeart(): void
  addHearts(n: number): void
  /** Cuesta REFILL_COST gemas. Devuelve false si no alcanza. */
  refillHearts(): boolean
  addGems(n: number): void
  spendGems(n: number): boolean
  addXp(n: number, source?: 'lesson' | 'practice' | 'quest' | 'demo'): void
  recordMistakes(lessonId: string, exercises: Exercise[]): void
  clearMistake(key: string): void
  buyFreeze(): boolean
  buyDoubleXp(): boolean
  /** Aplica el resultado de una lección completa y devuelve el resumen para la pantalla final. */
  finishLesson(lessonId: string, result: RunnerResult): LessonSummary
  /** Práctica: da XP, no cuenta como lección del mapa, recupera 1 corazón si `healHeart`. */
  finishPractice(result: RunnerResult, opts?: { healHeart?: boolean }): { xpGained: number }
  pushNotification(n: Omit<AppNotification, 'id' | 'at'>): void
  dismissNotification(id: string): void
  /** Patch genérico para módulos (quests, league, vacation, achievements...). */
  patch(partial: Partial<UserState> | ((s: UserState) => Partial<UserState>)): void
  advanceDays(n: number): void
  reset(): void
}

export type AppStore = UserState & Actions

export const useApp = create<AppStore>()(
  persist(
    (set, get) => ({
      ...initialState(),

      completeOnboarding: ({ name, avatar, level, dailyGoal }) =>
        set((s) => ({
          profile: { ...s.profile, name, avatar, level, onboarded: true },
          settings: { ...s.settings, dailyGoal },
        })),
      setSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
      setProfile: (patch) => set((s) => ({ profile: { ...s.profile, ...patch } })),

      refresh: () => {
        const s = get()
        const t = now()
        const day = today()
        const h = regenHearts({ hearts: s.hearts, heartsAnchor: s.heartsAnchor }, t)
        const streak = resolveStreak(s.streak, day)
        const changedDay = s.quests.day !== day
        set({ ...h, streak })
        if (streak.count !== s.streak.count) emit('streak-changed', { count: streak.count })
        if (changedDay) emit('day-changed', { day })
      },

      loseHeart: () => {
        const s = get()
        const h = ruleLoseHeart({ hearts: s.hearts, heartsAnchor: s.heartsAnchor }, now())
        set(h)
        emit('heart-lost', { remaining: h.hearts })
      },
      addHearts: (n) =>
        set((s) => {
          const hearts = Math.min(HEARTS_MAX, s.hearts + n)
          return { hearts, heartsAnchor: hearts >= HEARTS_MAX ? now() : s.heartsAnchor }
        }),
      refillHearts: () => {
        const s = get()
        if (s.gems < REFILL_COST || s.hearts >= HEARTS_MAX) return false
        set({ gems: s.gems - REFILL_COST, hearts: HEARTS_MAX, heartsAnchor: now() })
        return true
      },
      addGems: (n) => set((s) => ({ gems: Math.max(0, s.gems + n) })),
      spendGems: (n) => {
        if (get().gems < n) return false
        set((s) => ({ gems: s.gems - n }))
        return true
      },
      addXp: (n, source = 'demo') => {
        const day = today()
        set((s) => ({ xp: s.xp + n, xpByDay: { ...s.xpByDay, [day]: (s.xpByDay[day] ?? 0) + n } }))
        emit('xp-gained', { amount: n, source })
      },

      recordMistakes: (lessonId, exercises) =>
        set((s) => {
          const map = new Map(s.mistakes.map((m) => [m.key, m]))
          for (const ex of exercises) {
            const key = `${lessonId}:${ex.id}`
            map.set(key, { key, lessonId, exercise: ex, at: now() } as MistakeEntry)
          }
          return { mistakes: [...map.values()].slice(-60) }
        }),
      clearMistake: (key) => set((s) => ({ mistakes: s.mistakes.filter((m) => m.key !== key) })),

      buyFreeze: () => {
        const s = get()
        if (s.streak.freezes >= 2 || s.gems < FREEZE_COST) return false
        set({ gems: s.gems - FREEZE_COST, streak: { ...s.streak, freezes: s.streak.freezes + 1 } })
        return true
      },
      buyDoubleXp: () => {
        const s = get()
        if (s.gems < DOUBLE_XP_COST) return false
        set({ gems: s.gems - DOUBLE_XP_COST, doubleXpUntil: Math.max(now(), s.doubleXpUntil) + DOUBLE_XP_MS })
        return true
      },

      finishLesson: (lessonId, result) => {
        const s = get()
        const t = now()
        const day = today()
        const perfect = result.perfect
        const fast = result.seconds <= result.total * FAST_SECONDS_PER_EXERCISE
        const firstTime = !s.completed[lessonId]
        let xp = lessonXp({ perfect, fast })
        if (s.doubleXpUntil > t) xp *= 2
        const gems = lessonGems(perfect)
        const { streak, extended } = applyActivity(s.streak, day)
        const prevToday = s.xpByDay[day] ?? 0
        const accuracy = result.total ? Math.round((result.correct / result.total) * 100) : 100
        const prev = s.completed[lessonId]
        const vocab = new Map(s.vocabulary.map((v) => [v.en.toLowerCase(), v]))
        for (const ex of getLesson(lessonId)?.exercises ?? []) for (const v of ex.vocab ?? []) vocab.set(v.en.toLowerCase(), v)
        const summary: LessonSummary = {
          lessonId, xpGained: xp, gemsGained: gems, accuracy, seconds: result.seconds, perfect, fast,
          streakExtended: extended, streak: streak.count,
          goalReached: prevToday < s.settings.dailyGoal && prevToday + xp >= s.settings.dailyGoal,
          firstTime,
        }
        set({
          xp: s.xp + xp,
          xpByDay: { ...s.xpByDay, [day]: prevToday + xp },
          gems: s.gems + gems,
          streak,
          completed: { ...s.completed, [lessonId]: { count: (prev?.count ?? 0) + 1, bestAccuracy: Math.max(prev?.bestAccuracy ?? 0, accuracy), lastAt: t } },
          stats: {
            lessonsCompleted: s.stats.lessonsCompleted + 1,
            perfectLessons: s.stats.perfectLessons + (perfect ? 1 : 0),
            correct: s.stats.correct + result.correct,
            total: s.stats.total + result.total,
            seconds: s.stats.seconds + result.seconds,
          },
          vocabulary: [...vocab.values()],
        })
        get().recordMistakes(lessonId, result.mistakes)
        emit('xp-gained', { amount: xp, source: 'lesson' })
        if (extended) emit('streak-changed', { count: streak.count })
        emit('lesson-finished', { summary, result, lessonId })
        return summary
      },

      finishPractice: (result, opts) => {
        const xp = 5 + (result.perfect ? 3 : 0)
        get().addXp(xp, 'practice')
        if (opts?.healHeart) get().addHearts(1)
        const { streak } = applyActivity(get().streak, today())
        set({ streak })
        return { xpGained: xp }
      },

      pushNotification: (n) =>
        set((s) => ({ notifications: [...s.notifications, { ...n, id: `n${now()}${Math.random().toString(36).slice(2, 6)}`, at: now() }].slice(-20) })),
      dismissNotification: (id) => set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),

      patch: (partial) => set((s) => (typeof partial === 'function' ? partial(s) : partial)),

      advanceDays: (n) => {
        const offset = get().clockOffset + n * DAY
        setClockOffset(offset)
        set({ clockOffset: offset })
        get().refresh()
      },

      reset: () => {
        setClockOffset(0)
        set({ ...initialState() })
      },
    }),
    {
      name: 'skills-go-v1',
      version: 1,
      partialize: (s) => {
        const { completeOnboarding, setSettings, setProfile, refresh, loseHeart, addHearts, refillHearts, addGems, spendGems, addXp, recordMistakes, clearMistake, buyFreeze, buyDoubleXp, finishLesson, finishPractice, pushNotification, dismissNotification, patch, advanceDays, reset, ...state } = s
        void [completeOnboarding, setSettings, setProfile, refresh, loseHeart, addHearts, refillHearts, addGems, spendGems, addXp, recordMistakes, clearMistake, buyFreeze, buyDoubleXp, finishLesson, finishPractice, pushNotification, dismissNotification, patch, advanceDays, reset]
        return state
      },
      onRehydrateStorage: () => (state) => {
        if (state) {
          setClockOffset(state.clockOffset ?? 0)
          state.refresh()
        }
      },
    },
  ),
)

/** Selector útil: progreso del día (XP de hoy). */
export const selectXpToday = (s: UserState) => s.xpByDay[dayKey()] ?? 0
