import type { QuestKind, QuestState, QuestsState } from '@/domain/types'

// ---------------------------------------------------------------------------
// Lógica PURA de misiones (sin store). Los efectos viven en register.ts / questActions.ts.
// ---------------------------------------------------------------------------

export const MONTHLY_TARGET = 500
export const MONTHLY_REWARD = 100

interface PoolEntry {
  kind: Extract<QuestKind, 'xp' | 'lessons' | 'perfect' | 'accuracy'>
  title: string
  target: number
  /** Recompensa base (10–30 gemas). */
  reward: number
}

export const QUEST_POOL: PoolEntry[] = [
  { kind: 'xp', title: 'Ganá 30 XP', target: 30, reward: 20 },
  { kind: 'lessons', title: 'Completá 2 lecciones', target: 2, reward: 15 },
  { kind: 'perfect', title: 'Hacé una lección sin errores', target: 1, reward: 25 },
  { kind: 'accuracy', title: 'Respondé bien el 90% de una lección', target: 1, reward: 30 },
]

/** Hash determinístico y barato de un string (FNV-1a). */
export function hashStr(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export const monthOf = (day: string) => day.slice(0, 7)

/** 3 misiones diarias elegidas del pool, determinísticas por día. Siempre 3 distintas. */
export function generateDailyQuests(day: string, xpToday = 0): QuestState[] {
  const h = hashStr(day)
  const skip = h % QUEST_POOL.length // se descarta una por día → rotan
  const chosen = QUEST_POOL.filter((_, i) => i !== skip)
  // el orden también rota para que no sea siempre igual
  const rot = (h >> 3) % chosen.length
  const ordered = [...chosen.slice(rot), ...chosen.slice(0, rot)]
  return ordered.map((p, i) => ({
    id: `d-${day}-${p.kind}`,
    kind: p.kind,
    title: p.title,
    target: p.target,
    progress: p.kind === 'xp' ? Math.min(p.target, xpToday) : 0,
    // pequeña variación determinística de ±5 dentro de 10–30
    rewardGems: Math.max(10, Math.min(30, p.reward + ((((h >> (i + 1)) % 3) - 1) * 5))),
    claimed: false,
  }))
}

export function generateMonthlyQuest(day: string, xpThisMonth = 0): QuestState {
  return {
    id: `m-${monthOf(day)}`,
    kind: 'xp',
    title: 'Misión de vacaciones: ganá 500 XP este mes',
    target: MONTHLY_TARGET,
    progress: Math.min(MONTHLY_TARGET, xpThisMonth),
    rewardGems: MONTHLY_REWARD,
    claimed: false,
  }
}

export function xpOfMonth(xpByDay: Record<string, number>, day: string): number {
  const m = monthOf(day)
  return Object.entries(xpByDay).reduce((a, [k, v]) => (k.startsWith(m) ? a + v : a), 0)
}

/** Devuelve el estado vigente para `day`: regenera las diarias si cambió el día y la mensual si cambió el mes. */
export function ensureQuests(q: QuestsState, day: string, xpByDay: Record<string, number> = {}): QuestsState {
  const dayOk = q.day === day && q.daily.length > 0
  const monthOk = !!q.monthly && q.monthly.id === `m-${monthOf(day)}`
  if (dayOk && monthOk) return q
  return {
    day,
    daily: dayOk ? q.daily : generateDailyQuests(day, xpByDay[day] ?? 0),
    monthly: monthOk ? q.monthly : generateMonthlyQuest(day, xpOfMonth(xpByDay, day)),
  }
}

export type QuestEvent =
  | { type: 'xp'; amount: number }
  | { type: 'lesson'; perfect: boolean; accuracy: number }

const bump = (qs: QuestState, by: number): QuestState =>
  qs.claimed || by <= 0 ? qs : { ...qs, progress: Math.min(qs.target, qs.progress + by) }

/** Aplica un evento a las misiones. Función pura. */
export function applyQuestEvent(q: QuestsState, ev: QuestEvent): QuestsState {
  const daily = q.daily.map((qs) => {
    if (ev.type === 'xp') return qs.kind === 'xp' ? bump(qs, ev.amount) : qs
    switch (qs.kind) {
      case 'lessons': return bump(qs, 1)
      case 'perfect': return ev.perfect ? bump(qs, 1) : qs
      case 'accuracy': return ev.accuracy >= 90 ? bump(qs, 1) : qs
      default: return qs
    }
  })
  const monthly = q.monthly && ev.type === 'xp' ? bump(q.monthly, ev.amount) : q.monthly
  return { ...q, daily, monthly }
}

export const isComplete = (qs: QuestState) => qs.progress >= qs.target
export const isClaimable = (qs: QuestState) => isComplete(qs) && !qs.claimed

/** Cantidad de misiones completas (diarias + mensual) — sirve para detectar cruces de meta. */
export function completedCount(q: QuestsState): number {
  return q.daily.filter(isComplete).length + (q.monthly && isComplete(q.monthly) ? 1 : 0)
}

/** Marca una misión como reclamada. Devuelve el nuevo estado y las gemas a sumar (0 si no se puede). */
export function claimQuestIn(q: QuestsState, id: string): { quests: QuestsState; gems: number } {
  let gems = 0
  const mark = (qs: QuestState): QuestState => {
    if (qs.id !== id || !isClaimable(qs)) return qs
    gems = qs.rewardGems
    return { ...qs, claimed: true }
  }
  const quests = { ...q, daily: q.daily.map(mark), monthly: q.monthly ? mark(q.monthly) : null }
  return { quests: gems ? quests : q, gems }
}

/** ms hasta el fin del día (medianoche local) a partir de `nowMs`. */
export function msToEndOfDay(nowMs: number): number {
  const d = new Date(nowMs)
  const end = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1, 0, 0, 0, 0)
  return end.getTime() - nowMs
}
