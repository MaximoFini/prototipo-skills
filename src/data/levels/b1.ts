import type { Unit } from '@/domain/types'

const soon = (unit: string, titles: string[]) =>
  titles.map((title, i) => ({ id: `${unit}-l${i + 1}`, title, exercises: [] }))

export const b1Units: Unit[] = [
  {
    id: 'b1-u7', level: 'B1', number: 7, title: 'Travel & dreams',
    description: 'Contá adónde viajaste, adónde soñás ir y qué harías si pudieras',
    lessons: [
      {
        id: 'b1-u7-l1', title: 'Viajes y sueños',
        exercises: [
          { id: 'e1', type: 'choose-image', word: 'suitcase', options: [{ emoji: '🎫', label: 'ticket' }, { emoji: '🗺️', label: 'map' }, { emoji: '🧳', label: 'suitcase' }, { emoji: '🛂', label: 'passport' }], correct: 2, explanation: '"Suitcase" es la valija. También se dice "luggage" al hablar del equipaje en general.', vocab: [{ en: 'suitcase', es: 'valija', emoji: '🧳' }, { en: 'ticket', es: 'pasaje', emoji: '🎫' }, { en: 'passport', es: 'pasaporte', emoji: '🛂' }] },
          { id: 'e2', type: 'match-pairs', pairs: [{ en: 'airport', es: 'aeropuerto' }, { en: 'flight', es: 'vuelo' }, { en: 'luggage', es: 'equipaje' }, { en: 'reservation', es: 'reserva' }, { en: 'passport', es: 'pasaporte' }], explanation: '"Luggage" no tiene plural: se dice "my luggage", no "luggages".', vocab: [{ en: 'airport', es: 'aeropuerto', emoji: '✈️' }, { en: 'flight', es: 'vuelo' }, { en: 'luggage', es: 'equipaje' }, { en: 'reservation', es: 'reserva' }] },
          { id: 'e3', type: 'choose-translation', prompt: "I've been to Brazil twice.", promptLang: 'en', options: ['Voy a ir a Brasil dos veces.', 'Estuve en Brasil dos veces.', 'Vivo en Brasil hace dos años.'], correct: 1, explanation: '"I\'ve been to" cuenta experiencias de la vida, sin decir cuándo pasaron.', vocab: [{ en: 'twice', es: 'dos veces' }] },
          { id: 'e4', type: 'fill-blank', sentence: 'Have you ever ___ to Bariloche?', options: ['went', 'been', 'being'], correct: 1, translation: '¿Alguna vez estuviste en Bariloche?', explanation: 'El present perfect usa "have/has" + participio. El participio de "go" en este caso es "been".' },
          { id: 'e5', type: 'build-sentence', prompt: 'Nunca estuve en Europa', promptLang: 'es', accepted: ["I've never been to Europe", 'I have never been to Europe'], bank: ["I've", 'I', 'have', 'never', 'been', 'to', 'Europe', 'was', 'ever'], explanation: '"Never" va entre "have" y el participio: I have never been.' },
          { id: 'e6', type: 'listen-choose', audio: "I'd like to check in, please.", options: ['Quisiera hacer el check-in, por favor.', 'Quisiera cancelar la reserva.', 'Quisiera pedir la cuenta.'], correct: 0, explanation: '"Check in" es registrarse al llegar al hotel o al aeropuerto. "I\'d like" es muy cortés.', vocab: [{ en: 'check in', es: 'hacer el check-in' }] },
          { id: 'e7', type: 'fill-blank', sentence: 'If I had more money, I ___ travel to Japan.', options: ['will', 'would', 'had'], correct: 1, translation: 'Si tuviera más plata, viajaría a Japón.', explanation: 'Para situaciones imaginarias: If + pasado, would + verbo.', vocab: [{ en: 'would', es: 'condicional (-ría)' }] },
          { id: 'e8', type: 'type-translation', prompt: 'Si tuviera tiempo, viajaría', promptLang: 'es', accepted: ['If I had time, I would travel', "If I had time, I'd travel", 'If I had time I would travel', "If I had time I'd travel"], explanation: 'Se puede contraer "I would" a "I\'d".' },
          { id: 'e9', type: 'listen-type', audio: 'We have booked a hotel near the beach.', accepted: ['We have booked a hotel near the beach.', 'We have booked a hotel near the beach', "We've booked a hotel near the beach.", "We've booked a hotel near the beach"], translation: 'Reservamos un hotel cerca de la playa.', explanation: '"Book" es reservar. "Have booked" muestra que la reserva ya está hecha.', vocab: [{ en: 'book', es: 'reservar' }, { en: 'hotel', es: 'hotel', emoji: '🏨' }] },
          { id: 'e10', type: 'speak', phrase: "I've always wanted to visit Paris.", translation: 'Siempre quise visitar París.', explanation: '"Always" va entre "have" y el participio. ¡Soñá en grande!' },
        ],
      },
    ],
  },
  {
    id: 'b1-u8', level: 'B1', number: 8, title: 'Work & future',
    description: 'Hablá de trabajos, estudios y de lo que querés ser',
    comingSoon: true,
    lessons: soon('b1-u8', ['Jobs and skills', 'Future plans', 'Interviews']),
  },
  {
    id: 'b1-u9', level: 'B1', number: 9, title: 'Stories & news',
    description: 'Contá historias, entendé noticias y dá tu opinión',
    comingSoon: true,
    lessons: soon('b1-u9', ['Telling a story', 'In the news', 'My opinion']),
  },
]
