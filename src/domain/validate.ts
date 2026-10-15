import type { Exercise } from './types'

/** Normaliza para comparar: minúsculas, sin acentos, sin puntuación, espacios simples. */
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[¿?¡!.,;:"“”()]/g, '')
    .replace(/['’]/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

/** Distancia de Levenshtein. */
export function distance(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)])
  for (let j = 1; j <= b.length; j++) dp[0][j] = j
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
  return dp[a.length][b.length]
}

export type TypedVerdict = 'correct' | 'almost' | 'wrong'

/**
 * Compara lo escrito contra las respuestas aceptadas.
 * 'almost' = a 1 typo de distancia en frases de 8+ caracteres (se acepta pero se avisa "¡Ojo con la ortografía!").
 */
export function checkTyped(input: string, accepted: string[]): { verdict: TypedVerdict; best: string } {
  const n = normalize(input)
  if (!n) return { verdict: 'wrong', best: accepted[0] }
  let best = accepted[0]
  let bestDist = Infinity
  for (const a of accepted) {
    const na = normalize(a)
    if (na === n) return { verdict: 'correct', best: a }
    const d = distance(na, n)
    if (d < bestDist) {
      bestDist = d
      best = a
    }
  }
  if (bestDist === 1 && normalize(best).length >= 8) return { verdict: 'almost', best }
  return { verdict: 'wrong', best: accepted[0] }
}

/** Compara las palabras armadas con las variantes aceptadas. */
export function checkBuilt(words: string[], accepted: string[]): { correct: boolean; best: string } {
  const n = normalize(words.join(' '))
  const hit = accepted.find((a) => normalize(a) === n)
  return { correct: !!hit, best: hit ?? accepted[0] }
}

/** Respuesta correcta en texto, para mostrar en el panel de feedback. */
export function correctAnswerText(ex: Exercise): string {
  switch (ex.type) {
    case 'choose-translation':
    case 'listen-choose':
      return ex.options[ex.correct]
    case 'fill-blank':
      return ex.sentence.replace('___', ex.options[ex.correct])
    case 'choose-image':
      return ex.options[ex.correct].label
    case 'build-sentence':
    case 'type-translation':
    case 'listen-type':
      return ex.accepted[0]
    case 'match-pairs':
      return ex.pairs.map((p) => `${p.en} = ${p.es}`).join(' · ')
    case 'speak':
      return ex.phrase
  }
}
