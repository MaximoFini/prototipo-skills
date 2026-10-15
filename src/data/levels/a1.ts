import type { Unit } from '@/domain/types'

// PLACEHOLDER de Fase 0 — el subagente D1 reemplaza este archivo con las 4 unidades / 12 lecciones de A1.
// La primera lección usa los 8 tipos de ejercicio (sirve para probar el motor).
export const a1Units: Unit[] = [
  {
    id: 'a1-u1', level: 'A1', number: 1, title: 'Hello!', description: 'Saludá y presentate',
    lessons: [
      {
        id: 'a1-u1-l1', title: 'Saludos',
        exercises: [
          { id: 'e1', type: 'choose-translation', prompt: 'Hello, my name is Sofi.', promptLang: 'en', options: ['Hola, me llamo Sofi.', 'Chau, soy Sofi.', 'Hola, tengo Sofi.'], correct: 0, explanation: '"My name is" se usa para presentarte.', vocab: [{ en: 'hello', es: 'hola' }] },
          { id: 'e2', type: 'build-sentence', prompt: 'Yo soy estudiante', promptLang: 'es', accepted: ['I am a student', "I'm a student"], bank: ['I', 'am', 'a', 'student', 'is', 'you'], explanation: '"I am" = "yo soy". Con profesiones se agrega "a".' },
          { id: 'e3', type: 'type-translation', prompt: 'Buenos días', promptLang: 'es', accepted: ['Good morning'], explanation: '"Good morning" se usa hasta el mediodía.' },
          { id: 'e4', type: 'match-pairs', pairs: [{ en: 'hello', es: 'hola' }, { en: 'goodbye', es: 'chau' }, { en: 'please', es: 'por favor' }, { en: 'thanks', es: 'gracias' }] },
          { id: 'e5', type: 'listen-type', audio: 'Nice to meet you', accepted: ['Nice to meet you'], translation: 'Encantado de conocerte' },
          { id: 'e6', type: 'listen-choose', audio: 'How are you?', options: ['¿Cómo estás?', '¿Quién sos?', '¿Dónde vivís?'], correct: 0 },
          { id: 'e7', type: 'fill-blank', sentence: 'My name ___ Lucas.', options: ['is', 'are', 'am'], correct: 0, translation: 'Me llamo Lucas.', explanation: 'Con "name" (3ª persona) va "is".' },
          { id: 'e8', type: 'choose-image', word: 'pizza', options: [{ emoji: '🍕', label: 'pizza' }, { emoji: '🍔', label: 'hamburger' }, { emoji: '🍎', label: 'apple' }, { emoji: '🥛', label: 'milk' }], correct: 0 },
          { id: 'e9', type: 'speak', phrase: 'Good afternoon', translation: 'Buenas tardes' },
        ],
      },
    ],
  },
]
