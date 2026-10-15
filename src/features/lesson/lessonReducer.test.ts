import { describe, expect, it } from 'vitest'
import type { Exercise } from '@/domain/types'
import { buildResult, currentItem, initLesson, lessonReducer, progressPct, type LessonAction, type LessonState } from './lessonReducer'
import { evaluate } from './evaluate'

const mk = (n: number): Exercise[] =>
  Array.from({ length: n }, (_, i) => ({ id: `e${i}`, type: 'type-translation', prompt: 'x', promptLang: 'es', accepted: ['y'] }) as Exercise)

const run = (s: LessonState, ...acts: LessonAction[]) => acts.reduce(lessonReducer, s)
const ok: LessonAction[] = [{ type: 'answer', correct: true }, { type: 'continue' }]
const bad: LessonAction[] = [{ type: 'answer', correct: false }, { type: 'continue' }]

describe('lessonReducer', () => {
  it('respeta el orden y termina perfecto', () => {
    let s = initLesson(mk(3), { consumesHearts: true, hearts: 5 })
    expect(currentItem(s)?.orig).toBe(0)
    s = run(s, ...ok)
    expect(currentItem(s)?.orig).toBe(1)
    expect(progressPct(s)).toBeCloseTo(33.3, 0)
    s = run(s, ...ok, ...ok)
    expect(s.status).toBe('done')
    const r = buildResult(s, 42)
    expect(r).toMatchObject({ correct: 3, total: 3, perfect: true, heartsLost: 0, completed: true, seconds: 42 })
    expect(r.mistakes).toHaveLength(0)
    expect(progressPct(s)).toBe(100)
  })

  it('repite el ejercicio fallado al final de la cola', () => {
    let s = initLesson(mk(3), { consumesHearts: true, hearts: 5 })
    s = run(s, ...bad)
    expect(s.queue.map((q) => `${q.orig}:${q.attempt}`)).toEqual(['1:0', '2:0', '0:1'])
    expect(s.hearts).toBe(4)
    s = run(s, ...ok, ...ok, ...ok)
    expect(s.status).toBe('done')
    const r = buildResult(s, 10)
    expect(r.correct).toBe(2)
    expect(r.total).toBe(3)
    expect(r.mistakes.map((m) => m.id)).toEqual(['e0'])
    expect(r.perfect).toBe(false)
    expect(r.heartsLost).toBe(1)
  })

  it('máximo 2 repeticiones por ejercicio', () => {
    let s = initLesson(mk(1), { consumesHearts: false, hearts: 5 })
    s = run(s, ...bad, ...bad)
    expect(s.queue).toHaveLength(1)
    expect(s.queue[0].attempt).toBe(2)
    s = run(s, ...bad)
    expect(s.status).toBe('done')
    expect(s.heartsLost).toBe(0)
    expect(s.hearts).toBe(5)
    expect(buildResult(s, 1)).toMatchObject({ correct: 0, total: 1, completed: true })
  })

  it('un acierto en la repetición no cambia el primer intento', () => {
    let s = initLesson(mk(2), { consumesHearts: true, hearts: 5 })
    s = run(s, ...bad, ...ok, ...ok)
    expect(s.status).toBe('done')
    expect(buildResult(s, 1).correct).toBe(1)
  })

  it('corta al llegar a 0 corazones, después del feedback', () => {
    let s = initLesson(mk(4), { consumesHearts: true, hearts: 1 })
    s = run(s, ...ok)
    s = run(s, { type: 'answer', correct: false })
    expect(s.status).toBe('playing')
    expect(s.phase).toBe('feedback')
    expect(s.hearts).toBe(0)
    s = run(s, { type: 'continue' })
    expect(s.status).toBe('out')
    const r = buildResult(s, 5)
    expect(r).toMatchObject({ completed: false, correct: 1, total: 2, heartsLost: 1, perfect: false })
  })

  it('sin consumir corazones no corta aunque falle', () => {
    let s = initLesson(mk(2), { consumesHearts: false, hearts: 0 })
    s = run(s, ...bad)
    expect(s.status).toBe('playing')
  })

  it('omitir no penaliza ni cuenta', () => {
    let s = initLesson(mk(2), { consumesHearts: true, hearts: 5 })
    s = run(s, { type: 'skip' }, ...ok)
    expect(s.status).toBe('done')
    expect(buildResult(s, 1)).toMatchObject({ correct: 1, total: 1, perfect: true, heartsLost: 0 })
  })

  it('cuenta la racha de aciertos', () => {
    let s = initLesson(mk(5), { consumesHearts: false, hearts: 5 })
    s = run(s, ...ok, ...ok, ...ok)
    expect(s.streak).toBe(3)
    s = run(s, ...bad)
    expect(s.streak).toBe(0)
    expect(s.bestStreak).toBe(3)
  })

  it('ignora acciones fuera de fase', () => {
    const s = initLesson(mk(2), { consumesHearts: true, hearts: 5 })
    expect(lessonReducer(s, { type: 'continue' })).toBe(s)
    const f = run(s, { type: 'answer', correct: true })
    expect(lessonReducer(f, { type: 'answer', correct: false })).toBe(f)
  })

  it('lista vacía termina de entrada', () => {
    expect(initLesson([], { consumesHearts: true, hearts: 5 }).status).toBe('done')
  })
})

describe('evaluate', () => {
  it('typed: correcto, casi, mal', () => {
    const ex = { id: 'a', type: 'type-translation', prompt: 'x', promptLang: 'es', accepted: ['Good morning'] } as Exercise
    expect(evaluate(ex, 'good morning!').correct).toBe(true)
    const almost = evaluate(ex, 'good mornin')
    expect(almost).toMatchObject({ correct: true, almost: true })
    expect(evaluate(ex, 'hello').correct).toBe(false)
  })
  it('build y elección', () => {
    const b = { id: 'b', type: 'build-sentence', prompt: 'x', promptLang: 'es', accepted: ['I am a student'], bank: [] } as Exercise
    expect(evaluate(b, ['I', 'am', 'a', 'student']).correct).toBe(true)
    expect(evaluate(b, ['I', 'a', 'am']).correct).toBe(false)
    const c = { id: 'c', type: 'choose-translation', prompt: 'x', promptLang: 'en', options: ['a', 'b'], correct: 1 } as Exercise
    expect(evaluate(c, 1).correct).toBe(true)
    expect(evaluate(c, 0).correct).toBe(false)
  })
  it('unir pares siempre avanza; con tropiezos queda marcado como error', () => {
    const m = { id: 'm', type: 'match-pairs', pairs: [{ en: 'a', es: 'b' }] } as Exercise
    expect(evaluate(m, { errors: 0 })).toMatchObject({ correct: true, flawed: false })
    expect(evaluate(m, { errors: 3 })).toMatchObject({ correct: true, flawed: true })
  })
})

describe('unir pares y reanudar', () => {
  const ex = (i: number) => ({ id: `e${i}`, type: 'type-translation', prompt: 'x', promptLang: 'es', accepted: ['x'] }) as never
  it('cada par equivocado resta un corazón y a 0 corta en el acto', () => {
    let s = initLesson([ex(1), ex(2)], { consumesHearts: true, hearts: 2 })
    s = lessonReducer(s, { type: 'heart-lost' })
    expect(s.hearts).toBe(1)
    expect(s.status).toBe('playing')
    s = lessonReducer(s, { type: 'heart-lost' })
    expect(s.hearts).toBe(0)
    expect(s.status).toBe('out')
    expect(s.outFrom).toBe('match')
    expect(buildResult(s, 5).mistakes).toHaveLength(1)
  })
  it('completar unir pares con errores avanza sin repetirse y cuenta como error', () => {
    let s = initLesson([ex(1), ex(2)], { consumesHearts: true, hearts: 5 })
    s = lessonReducer(s, { type: 'heart-lost' })
    s = lessonReducer(s, { type: 'answer', correct: true, flawed: true })
    s = lessonReducer(s, { type: 'continue' })
    expect(s.queue).toHaveLength(1)
    expect(s.firstTry[0]).toBe(false)
    expect(s.streak).toBe(0)
  })
  it('tras recargar corazones retoma la lección (descarta el ejercicio fallado)', () => {
    let s = initLesson([ex(1), ex(2)], { consumesHearts: true, hearts: 1 })
    s = lessonReducer(s, { type: 'answer', correct: false })
    s = lessonReducer(s, { type: 'continue' })
    expect(s.status).toBe('out')
    s = lessonReducer(s, { type: 'resume', hearts: 5 })
    expect(s.status).toBe('playing')
    expect(s.hearts).toBe(5)
    expect(s.queue[0].orig).toBe(1)
  })
  it('si se cortó en unir pares, reintenta ese ejercicio', () => {
    let s = initLesson([ex(1), ex(2)], { consumesHearts: true, hearts: 1 })
    s = lessonReducer(s, { type: 'heart-lost' })
    s = lessonReducer(s, { type: 'resume', hearts: 5 })
    expect(s.queue[0].orig).toBe(0)
  })
})

describe('test de nivel', () => {
  it('sin repetición de errores', () => {
    let s = initLesson(mk(3), { consumesHearts: false, hearts: 5, repeatMistakes: false })
    s = run(s, ...bad, ...bad, ...bad)
    expect(s.status).toBe('done')
    expect(buildResult(s, 1).mistakes).toHaveLength(3)
  })
})
