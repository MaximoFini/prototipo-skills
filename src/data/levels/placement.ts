import type { Exercise } from '@/domain/types'

// Test de nivel — 8 preguntas de dificultad creciente.
// p1-p3 → A1, p4-p6 → A2, p7-p8 → B1 (ver placementLevelFor en content.ts).
export const placementTest: Exercise[] = [
  {
    id: 'p1', type: 'choose-translation', prompt: "What's your name?", promptLang: 'en',
    options: ['¿Dónde vivís?', '¿Cómo te llamás?', '¿Cuántos años tenés?'], correct: 1,
    explanation: '"What\'s your name?" = "¿cómo te llamás?". Es de lo primero que se aprende.',
  },
  {
    id: 'p2', type: 'build-sentence', prompt: 'Tengo quince años', promptLang: 'es',
    accepted: ['I am fifteen years old', "I'm fifteen years old"],
    bank: ['I', 'am', "I'm", 'fifteen', 'years', 'old', 'have', 'is'],
    explanation: 'En inglés la edad se dice con "to be": "I am fifteen years old", no con "have".',
  },
  {
    id: 'p3', type: 'listen-choose', audio: 'My sister is from Spain',
    options: ['Mi hermana vive en España', 'Mi hermana es de España', 'Mi mamá es de España'], correct: 1,
    explanation: '"My sister is from Spain" = "mi hermana es de España". "From" indica el origen.',
  },
  {
    id: 'p4', type: 'fill-blank', sentence: 'She ___ to school every day.',
    options: ['goes', 'go', 'going'], correct: 0, translation: 'Ella va a la escuela todos los días.',
    explanation: 'Con she/he/it, el presente simple lleva "-s" o "-es": she goes.',
  },
  {
    id: 'p5', type: 'fill-blank', sentence: 'Last weekend we ___ to the cinema.',
    options: ['go', 'goes', 'went'], correct: 2, translation: 'El fin de semana pasado fuimos al cine.',
    explanation: '"Last weekend" indica pasado. "Go" es irregular: su pasado es "went".',
  },
  {
    id: 'p6', type: 'fill-blank', sentence: 'My brother is ___ than me.',
    options: ['tall', 'taller', 'tallest'], correct: 1, translation: 'Mi hermano es más alto que yo.',
    explanation: 'Para comparar dos cosas se agrega "-er" y luego "than": taller than.',
  },
  {
    id: 'p7', type: 'fill-blank', sentence: 'I have ___ this series three times.',
    options: ['see', 'saw', 'seen'], correct: 2, translation: 'Vi esta serie tres veces.',
    explanation: 'Con "have" (present perfect) se usa el participio: "seen", no "saw".',
  },
  {
    id: 'p8', type: 'fill-blank', sentence: 'If it rains tomorrow, we ___ at home.',
    options: ['stay', 'will stay', 'stayed'], correct: 1, translation: 'Si llueve mañana, nos quedamos en casa.',
    explanation: 'En el primer condicional: "if" + presente, y en la otra parte "will" + verbo.',
  },
]
