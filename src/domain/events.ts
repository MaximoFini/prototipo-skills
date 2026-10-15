import type { LessonSummary, RunnerResult } from './types'

// Bus mínimo para que los módulos de gamificación reaccionen sin acoplarse al store.
export interface AppEvents {
  'lesson-finished': { summary: LessonSummary; result: RunnerResult; lessonId: string }
  'xp-gained': { amount: number; source: 'lesson' | 'practice' | 'quest' | 'demo' }
  'heart-lost': { remaining: number }
  'day-changed': { day: string }
  'streak-changed': { count: number }
}
type Handler<K extends keyof AppEvents> = (payload: AppEvents[K]) => void
const handlers: { [K in keyof AppEvents]?: Handler<K>[] } = {}

export function on<K extends keyof AppEvents>(event: K, h: Handler<K>): () => void {
  ;(handlers[event] ??= [] as never).push(h as never)
  return () => {
    const list = handlers[event] as Handler<K>[]
    list.splice(list.indexOf(h), 1)
  }
}
export function emit<K extends keyof AppEvents>(event: K, payload: AppEvents[K]) {
  ;(handlers[event] as Handler<K>[] | undefined)?.slice().forEach((h) => h(payload))
}
